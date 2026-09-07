// app/routes/api.voiceflow.tsx
import type { ActionFunction, LoaderFunction, AppLoadContext } from "@remix-run/node";
import { getVoiceflowApiKey, validateVoiceflowApiKey } from "../voiceflow.server";
import { authenticate, activateWebPixel } from "../shopify.server";
import { z } from "zod";
import prisma from "../db.server";

// Simple in-memory rate limiter
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit to 500 requests per window
  store: new Map<string, { count: number; resetTime: number }>()
};

// Conversation reset limit failsafe
const RESET_LIMIT = {
  max: 2, // Maximum number of conversation resets allowed per user
  windowMs: 30 * 60 * 1000, // 30 minutes reset window
  store: new Map<string, { count: number; resetTime: number }>()
};

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  
  // Clean up rate limit entries
  for (const [key, value] of RATE_LIMIT.store.entries()) {
    if (now > value.resetTime) {
      RATE_LIMIT.store.delete(key);
    }
  }
  
  // Clean up reset limit entries
  for (const [key, value] of RESET_LIMIT.store.entries()) {
    if (now > value.resetTime) {
      RESET_LIMIT.store.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Handles CORS preflight requests and adds CORS headers to responses.
 * @param request The incoming request.
 * @param response The response to add headers to.
 * @returns A new Response with CORS headers.
 */
function cors<T extends Response>(request: Request, response: T): T {
  const origin = request.headers.get("Origin") || "*";
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

// Define a Zod schema for the request data
const requestDataSchema = z.object({
  userId: z.string().min(1),
  viewedProductData: z.string().nullable(),
  customerOnProductPage: z.boolean(),
  shopDomain: z.string().min(1),
});

/**
 * Checks if a user has exceeded the conversation reset limit.
 * This failsafe prevents excessive credit consumption by limiting how many times
 * a user's conversation state can be cleared within a specified time window.
 * 
 * @param userId The unique identifier for the user
 * @returns Object with isAllowed boolean and remaining reset count
 */
function checkResetLimit(userId: string): { isAllowed: boolean; remaining: number } {
  const now = Date.now();
  const resetTime = now + RESET_LIMIT.windowMs;
  
  let userData = RESET_LIMIT.store.get(userId);
  if (!userData) {
    userData = { count: 0, resetTime };
    RESET_LIMIT.store.set(userId, userData);
  } else if (now > userData.resetTime) {
    // Reset if window expired
    userData.count = 0;
    userData.resetTime = resetTime;
  }
  
  const remaining = Math.max(0, RESET_LIMIT.max - userData.count);
  const isAllowed = userData.count < RESET_LIMIT.max;
  
  return { isAllowed, remaining };
}

/**
 * Increments the reset count for a user after a successful conversation state clear.
 * Should be called only after a state clear operation has been confirmed successful.
 * 
 * @param userId The unique identifier for the user
 */
function incrementResetCount(userId: string): void {
  const now = Date.now();
  const resetTime = now + RESET_LIMIT.windowMs;
  
  let userData = RESET_LIMIT.store.get(userId);
  if (!userData) {
    userData = { count: 1, resetTime };
    RESET_LIMIT.store.set(userId, userData);
  } else if (now > userData.resetTime) {
    // Reset if window expired
    userData.count = 1;
    userData.resetTime = resetTime;
  } else {
    userData.count++;
  }
}

/**
 * Loader function to handle GET requests for checking conversation state in Voiceflow.
 *
 * This function processes GET requests to verify if a conversation is ongoing 
 * for a specific user in Voiceflow. It uses the action `checkConversationState` 
 * to determine if interaction has occurred. If not, it cleans up the state to
 * ensure events start with a clean slate.
 *
 * @param request The Remix request object containing the URL and headers.
 * @returns A JSON response with the conversation state or an error message.
 *          - 200: Returns an object indicating whether the conversation is ongoing.
 *          - 401: Unauthorized access if session is not found.
 *          - 400: Missing required parameter `userId`.
 *          - 404: Voiceflow API key not configured for the store.
 *          - 405: Method not allowed or invalid action.
 *          - 500: Unexpected error with error details.
 */

export const loader: LoaderFunction = async ({ request, context }) => {
  // Handle CORS preflight requests at the very top
  if (request.method === "OPTIONS") {
    const response = new Response(null, {
      status: 204,
    });
    return cors(request, response);
  }

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    console.log(`[Loader] Method: ${request.method}, Action: ${action}, URL: ${request.url}`);

    // wipe attribution data
    if (action === "wipeTestData") {
      const secret = url.searchParams.get("secret");
      const wipeSecret = process.env.REMOTE_ACTIVATE_SECRET; // reuse your existing secret
      
      if (!secret || secret !== wipeSecret) {
        return cors(request, new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }));
      }
      
      try {
        const deleted = await prisma.attributionTracking.deleteMany({});
        console.log(`[Wipe] Deleted ${deleted.count} attribution records`);
        
        return cors(request, new Response(JSON.stringify({ 
          success: true, 
          deleted: deleted.count,
          message: "All attribution data wiped"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }));
      } catch (error) {
        return cors(request, new Response(JSON.stringify({ 
          error: "Wipe failed", 
          message: error.message 
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }));
      }
    }
    
    // wipe transcripts    
    if (action === "wipeTranscripts") {
      const secret = url.searchParams.get("secret");
      if (!secret || secret !== process.env.REMOTE_ACTIVATE_SECRET) {
        return cors(request, new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }));
      }

      const projectID = url.searchParams.get("projectID");
      if (!projectID) {
        return cors(request, new Response(JSON.stringify({ error: "Missing projectID parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }));
      }

      const voiceflowApiKey = getVoiceflowApiKey();
      if (!validateVoiceflowApiKey(voiceflowApiKey)) {
        return cors(request, new Response(JSON.stringify({ error: "Voiceflow API key not configured" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }));
      }

      try {
        let totalDeleted = 0;
        let skip = 0;
        const take = 100; // max allowed by API
        let hasMore = true;

        while (hasMore) {
          // Fetch a page of transcripts
          const searchResponse = await fetch(
            `https://analytics-api.voiceflow.com/v1/transcript/project/${projectID}?take=${take}&skip=${skip}&order=DESC`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": voiceflowApiKey,
              },
              body: JSON.stringify({}) // empty body = no filters = all transcripts
            }
          );

          if (!searchResponse.ok) {
            throw new Error(`Failed to fetch transcripts: ${searchResponse.status} ${searchResponse.statusText}`);
          }

          const searchData = await searchResponse.json();
          const transcripts = searchData.transcripts || [];

          console.log(`[Wipe Transcripts] Fetched ${transcripts.length} transcripts (skip=${skip})`);

          if (transcripts.length === 0) {
            hasMore = false;
            break;
          }

          // Delete each transcript in this page
          const deleteResults = await Promise.allSettled(
            transcripts.map((transcript: any) =>
              fetch(`https://analytics-api.voiceflow.com/v1/transcript/${transcript.id}`, {
                method: "DELETE",
                headers: {
                  "Authorization": voiceflowApiKey,
                }
              })
            )
          );

          const succeeded = deleteResults.filter(r => r.status === "fulfilled").length;
          const failed = deleteResults.filter(r => r.status === "rejected").length;
          totalDeleted += succeeded;

          console.log(`[Wipe Transcripts] Page deleted: ${succeeded} succeeded, ${failed} failed`);

          // If we got fewer than take, we've hit the end
          if (transcripts.length < take) {
            hasMore = false;
          } else {
            skip += take;
          }
        }

        console.log(`[Wipe Transcripts] Complete. Total deleted: ${totalDeleted}`);

        return cors(request, new Response(JSON.stringify({
          success: true,
          deleted: totalDeleted,
          message: `Deleted ${totalDeleted} transcripts`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }));

      } catch (error: any) {
        console.error("[Wipe Transcripts] Error:", error);
        return cors(request, new Response(JSON.stringify({
          error: "Wipe failed",
          message: error.message
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }));
      }
    }    

    // Handle debug attribution request
    if (action === "debugAttribution") {
      const shopDomain = url.searchParams.get("shop");
      
      if (!shopDomain) {
        return cors(request, new Response(JSON.stringify({ error: "Missing shop parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }));
      }
      
      try {
        // Get all attribution records for this shop
        const allAttributions = await prisma.attributionTracking.findMany({
          where: {
            shopDomain
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Latest 10 records
        });
        
        // Get count for different time periods
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const counts = {
          total: await prisma.attributionTracking.count({ where: { shopDomain } }),
          last24h: await prisma.attributionTracking.count({ 
            where: { shopDomain, createdAt: { gte: last24h } } 
          }),
          last7days: await prisma.attributionTracking.count({ 
            where: { shopDomain, createdAt: { gte: last7days } } 
          }),
          last30days: await prisma.attributionTracking.count({ 
            where: { shopDomain, createdAt: { gte: last30days } } 
          }),
        };
        
        return cors(request, new Response(JSON.stringify({
          shopDomain,
          counts,
          latestRecords: allAttributions,
          databasePath: process.env.DATABASE_URL || 'Not set',
          currentTime: now.toISOString()
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }));
      } catch (error) {
        console.error('Failed to debug attribution:', error);
        return cors(request, new Response(JSON.stringify({ 
          error: "Failed to debug attribution",
          message: error.message,
          stack: error.stack
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }));
      }
    }
    
    // Handle clear attribution request (for testing)
    if (action === "clearAttribution") {
      const shopDomain = url.searchParams.get("shop");
      
      if (!shopDomain) {
        return cors(request, new Response(JSON.stringify({ error: "Missing shop parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }));
      }
      
      try {
        // Delete all attribution records for this shop
        const deleteResult = await prisma.attributionTracking.deleteMany({
          where: {
            shopDomain
          }
        });
        
        console.log('[Clear Attribution] Deleted', deleteResult.count, 'records for shop:', shopDomain);
        
        return cors(request, new Response(JSON.stringify({
          success: true,
          message: `Deleted ${deleteResult.count} attribution records`,
          shop: shopDomain
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }));
      } catch (error) {
        console.error('Failed to clear attribution data:', error);
        return cors(request, new Response(JSON.stringify({ 
          error: "Failed to clear attribution data",
          message: error.message
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }));
      }
    }
    
    // Handle attribution stats request for dashboard
    if (action === "getAttributionStats") {
      const shopDomain = url.searchParams.get("shop");
      const days = parseInt(url.searchParams.get("days") || "30");
      
      if (!shopDomain) {
        return cors(request, new Response(JSON.stringify({ error: "Missing shop parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }));
      }
      
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        console.log('[Attribution Stats] Querying for shop:', shopDomain, 'since:', startDate.toISOString());
        
        // Get attribution count
        const attributions = await prisma.attributionTracking.count({
          where: {
            shopDomain,
            eventType: 'checkout_started',
            createdAt: {
              gte: startDate
            }
          }
        });
        
        console.log('[Attribution Stats] Found', attributions, 'attributions');
        
        // Get breakdown by type
        const breakdown = await prisma.attributionTracking.groupBy({
          by: ['attributionType'],
          where: {
            shopDomain,
            eventType: 'checkout_started',
            createdAt: {
              gte: startDate
            }
          },
          _count: true
        });
        
        console.log('[Attribution Stats] Breakdown:', breakdown);
        
        return cors(request, new Response(JSON.stringify({
          total: attributions,
          breakdown: breakdown.reduce((acc, item) => {
            acc[item.attributionType] = item._count;
            return acc;
          }, {}),
          period: `${days} days`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }));
      } catch (error) {
        console.error('Failed to fetch attribution stats:', error);
        return cors(request, new Response(JSON.stringify({ 
          error: "Failed to fetch attribution stats",
          message: error.message
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }));
      }
    }
    
    if (action === "checkConversationState") {
      // --- Authentication and Basic Parameter Checks ---
      // App proxy requests use HMAC validation, not sessions
      // Get shop domain from query params (validated by Shopify's HMAC)
      const shopDomain = url.searchParams.get("shop");
      
      if (!shopDomain) {
        return cors(request, new Response(JSON.stringify({ error: "Missing shop parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }));
      }
      
      // The HMAC signature in the URL params is already validated by Shopify
      // before the request reaches our app, so we can trust the shop domain
      const userId = url.searchParams.get("userId");
      const widgetOpenParam = url.searchParams.get("widgetOpen");
      const isWidgetOpen = widgetOpenParam === "true";
      const originatingEventName = url.searchParams.get("eventName"); // <-- Get the event name

      if (!userId) {
        return cors(request, new Response(
          JSON.stringify({ error: "Missing required parameter: userId" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        ));
      }

      // --- Get Voiceflow API Key from environment ---
      const voiceflowApiKey = getVoiceflowApiKey();
      
      if (!validateVoiceflowApiKey(voiceflowApiKey)) {
        console.error(`No valid Voiceflow API key found for store: ${shopDomain}`);
        return cors(request, new Response(
          JSON.stringify({ error: "Voiceflow API key not configured" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        ));
      }

      // --- Fetch Voiceflow State ---
      const stateResponse = await fetch(
        `https://general-runtime.voiceflow.com/state/user/${userId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            versionID: "production",
            Authorization: voiceflowApiKey,
          },
        }
      );

      // Handle case where user state doesn't exist yet (404 is expected)
      let stateData: any = {};
      if (stateResponse.status === 404) {
          console.log(`No existing state found for user: ${userId}. Treating as no conversation ongoing.`);
          stateData = {}; // Ensure stateData is an empty object
      } else if (!stateResponse.ok) {
        // Handle other potential API errors
        return cors(request, new Response(
          JSON.stringify({
            error: `Voiceflow API error fetching state: ${stateResponse.statusText}`,
          }),
          {
            status: stateResponse.status,
            headers: { "Content-Type": "application/json" },
          }
        ));
      } else {
          // Parse state if response was successful (2xx)
          stateData = await stateResponse.json();
      }


      // --- Determine Conversation State ---
      let isConversationOngoing = false;
      if (
        stateData &&
        Object.keys(stateData).length > 0 && // Check if stateData is not empty
        stateData.variables &&
        stateData.variables.last_event
      ) {
        const lastEventType = stateData.variables.last_event.type;
        isConversationOngoing =
          lastEventType !== "launch" && lastEventType !== "event";
      }
      // If stateData is empty or last_event is missing, isConversationOngoing remains false.

      // --- Determine if State Should Be Cleared ---
      let shouldClearState = false; // Default to NOT clearing

      if (!isConversationOngoing) {
        // We only consider clearing state if no active conversation is detected

        const requiresStatePreservation =
          stateData.variables?.shouldClearState === "false";
        const isEmailCaptureEvent = originatingEventName === "emailCaptureMessage";

        // Check reset limit before proceeding with state clearing logic
        const resetLimitCheck = checkResetLimit(userId);
        
        if (!resetLimitCheck.isAllowed) {
          // User has exceeded reset limit - treat conversation as ongoing to prevent further events
          shouldClearState = false;
          isConversationOngoing = true; // Force conversation to appear ongoing
          console.log(
            `State not cleared for user ${userId}: Reset limit exceeded (${RESET_LIMIT.max} resets in ${RESET_LIMIT.windowMs / 60000} minutes). Treating conversation as ongoing to prevent excessive credit usage.`
          );
        } else if (isWidgetOpen) {
          // NEVER clear state if the widget is currently open
          shouldClearState = false;
          console.log(`State not cleared for user ${userId}: Widget is open.`);
        } else if (requiresStatePreservation && !isEmailCaptureEvent) {
          // Clear state is set to 'false', AND it's NOT the email capture event trying to trigger
          shouldClearState = false;
          console.log(
            `State not cleared for user ${userId}: shouldClearState is false and event is not emailCaptureMessage.`
          );
        } else {
          // Clear state if:
          // 1. Widget is closed AND shouldClearState is not 'false'
          // 2. Widget is closed AND it IS the emailCaptureMessage event (overriding shouldClearState='false')
          shouldClearState = true;
          console.log(
            `State clearing approved for user ${userId}: ${resetLimitCheck.remaining} resets remaining in current window.`
          );
          if (requiresStatePreservation && isEmailCaptureEvent) {
             console.log(`State WILL be cleared for user ${userId}: Email capture event overriding shouldClearState='false'.`);
          }
        }
      } else {
          console.log(`State not cleared for user ${userId}: Conversation is ongoing.`);
      }


      // --- Perform State Clearing if Necessary ---
      if (shouldClearState) {
        console.log(`Attempting to clear state for user: ${userId}`);
        const deleteResponse = await fetch(
          `https://general-runtime.voiceflow.com/state/user/${userId}`,
          {
            method: "DELETE",
            headers: {
              accept: "application/json",
              versionID: "production",
              Authorization: voiceflowApiKey,
            },
          }
        );
        if (deleteResponse.ok) {
            console.log(`State successfully cleared for user: ${userId}`);
            // Increment the reset count only after successful state clear
            incrementResetCount(userId);
            const remainingResets = checkResetLimit(userId).remaining;
            console.log(`Reset count incremented. User ${userId} has ${remainingResets} resets remaining.`);
        } else {
            console.error(`Failed to clear state for user ${userId}: ${deleteResponse.status} ${deleteResponse.statusText}`);
             // Decide if you want to proceed despite failed clear.
             // For safety, maybe report conversation as ongoing if clear fails?
             // isConversationOngoing = true; // Or handle differently
        }
        // If state was just cleared, the effective conversation state is now 'not ongoing'
        isConversationOngoing = false;
      }

      // --- Return Conversation State ---
      return cors(request, new Response(JSON.stringify({ isConversationOngoing }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }));
    }

    // --- Handle Invalid Action ---
    return cors(request, new Response(
      JSON.stringify({ error: "Method not allowed or invalid action" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    ));
  } catch (error: any) {
    console.error("Unexpected error in loader:", error);
    return cors(request, new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    ));
  }
};

  /**
   * Endpoint to update a user's variables in Voiceflow.
   *
   * This endpoint is rate-limited to 100 requests per 15 minutes per shop.
   * It accepts a POST request with the following JSON body:
   *  - `userId`: The ID of the user in Voiceflow.
   *  - `viewedProductData`: The data of the viewed product, if any.
   *  - `customerOnProductPage`: A boolean indicating whether the customer is on a product page.
   *  - `shop`: The shop domain, if not provided in the headers.
   *
   * The endpoint will return a 200 status code if the update is successful, or a 400 or 500 status code with an error message if something goes wrong.
   *
   * @param request The Remix request object.
   * @returns A response from the Voiceflow API.
   */
export const action: ActionFunction = async ({ request, context }) => {
  // Handle CORS preflight requests at the very top
  if (request.method === "OPTIONS") {
    const response = new Response(null, {
      status: 204,
    });
    return cors(request, response);
  }

  try {
    // Get shop domain from headers or URL for rate limiting
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get('shop') || 'unknown-shop';
    const action = url.searchParams.get('action');

    // Handle attribution tracking (bypasses rate limiting for internal tracking)
    if (['trackChatAttribution', 'trackCheckout', 'trackAddToCart', 'trackCheckoutCompleted'].includes(action || '')) {
      console.log(`[Attribution] Received ${action} request for shop: ${shopDomain}`);
      
      // Log request headers to help identify origin
      const userAgent = request.headers.get('user-agent');
      const referer = request.headers.get('referer');
      const xForwardedFor = request.headers.get('x-forwarded-for');
      console.log('[Attribution] Request headers:', {
        userAgent: userAgent?.substring(0, 100),
        referer,
        xForwardedFor,
        method: request.method
      });
      
      const data = await request.json();
      console.log('[Attribution] Request data:', JSON.stringify(data, null, 2));
      
      // Add stack trace info if possible (for debugging)
      if (data.debugInfo) {
        console.log('[Attribution] Debug info from client:', data.debugInfo);
      }
      
      try {
        // Prevent duplicate attributions for the same session/user within a short time window
        const dedupeKey = `${data.userId || 'anon'}_${data.sessionId || 'nosession'}`;
        const recentCheck = await prisma.attributionTracking.findFirst({
          where: {
            shopDomain,
            userId: data.userId || null,
            sessionId: data.sessionId || null,
            createdAt: {
              gte: new Date(Date.now() - 5000) // Within last 5 seconds
            }
          }
        });
        
        if (recentCheck) {
          console.log(`[Attribution] Duplicate attribution detected for ${dedupeKey}, skipping`);
          return cors(request, new Response(JSON.stringify({ 
            success: true, 
            message: 'Duplicate attribution skipped',
            id: recentCheck.id,
            duplicate: true
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        // Determine attribution type and event type based on the action and data
        let attributionType = 'unknown';
        let eventType = 'unknown';
        
        if (action === 'trackCheckout') {
          // From checkout-tracking.js - means conversation was ongoing at checkout
          attributionType = 'ongoing_conversation';
          eventType = 'checkout_started';
        } else if (action === 'trackAddToCart') {
          // From web pixel - means conversation was ongoing or within 24h of cart addition
          attributionType = data.conversationOngoing ? 'ongoing_conversation' : 'within_window';
          eventType = 'add_to_cart';
        } else if (action === 'trackCheckoutCompleted') {
          // From web pixel - means conversation was ongoing or within 24h of checkout completion
          attributionType = data.conversationOngoing ? 'ongoing_conversation' : 'within_window';
          eventType = 'checkout_completed';
        } else if (action === 'trackChatAttribution') {
          // From simple-attribution-tracker.js - means checkout within window of interaction
          attributionType = data.attributionType || 'within_window';
          eventType = 'checkout_started';
        }
        
        console.log('[Attribution] Creating database record...');
        
        // Prepare metadata based on event type
        let metadata = null;
        if (eventType === 'add_to_cart' || eventType === 'checkout_completed') {
          // Store product/cart details for cart attributions
          metadata = {
            productId: data.productId,
            productTitle: data.productTitle,
            variantId: data.variantId, 
            variantTitle: data.variantTitle,
            quantity: data.quantity,
            price: data.price,
            currency: data.currency
          };
        } else if (data.metadata) {
          // Use existing metadata for other event types
          metadata = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
        }
        
        // Store in database
        const attribution = await prisma.attributionTracking.create({
          data: {
            shopDomain,
            attributionType,
            eventType,
            userId: data.userId || null,
            customerId: data.customerId?.toString() || null,
            customerEmail: data.customerEmail || null,
            sessionId: data.sessionId || null,
            cartValue: data.cartValue ? parseFloat(data.cartValue) : (data.price ? parseFloat(data.price) : null),
            daysSinceInteraction: data.daysSinceInteraction ? parseFloat(data.daysSinceInteraction) : null,
            interactionCount: data.interactionCount ? parseInt(data.interactionCount) : null,
            firstInteraction: data.firstInteraction ? new Date(data.firstInteraction) : null,
            lastInteraction: data.lastInteraction ? new Date(data.lastInteraction) : null,
            metadata: metadata ? JSON.stringify(metadata) : null
          }
        });
        
        console.log(`[Attribution] Stored ${action} for ${shopDomain}:`, attribution.id);
        
        return cors(request, new Response(JSON.stringify({ 
          success: true, 
          message: 'Attribution tracked',
          id: attribution.id
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      } catch (error) {
        console.error('Failed to store attribution:', error);
        return cors(request, new Response(JSON.stringify({ 
          success: false, 
          message: 'Failed to store attribution',
          error: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
    }
    
    // Handle Web Pixel activation (manual trigger for testing)
    if (action === 'activateWebPixel') {
      console.log(`[Web Pixel Manual] Testing activation for shop: ${shopDomain}`);
      
      try {
        // Get the Shopify session for this shop
        const { session } = await authenticate.admin(request);
        
        // Use the same function that runs in afterAuth hook
        await activateWebPixel(session);
        
        return cors(request, new Response(JSON.stringify({ 
          success: true, 
          message: 'Web Pixel activation test completed. Check console logs for details.',
          shop: session.shop
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
        
      } catch (error) {
        console.error('[Web Pixel Manual] Failed to test activation:', error);
        return cors(request, new Response(JSON.stringify({ 
          success: false, 
          message: 'Failed to test Web Pixel activation',
          error: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
    }
    
    // Apply rate limiting for regular Voiceflow updates
    const now = Date.now();
    const resetTime = now + RATE_LIMIT.windowMs;

    let clientData = RATE_LIMIT.store.get(shopDomain);
    if (!clientData) {
      clientData = { count: 0, resetTime };
    RATE_LIMIT.store.set(shopDomain, clientData);
    } else if (now > clientData.resetTime) {
    // Reset if window expired
    clientData.count = 0;
    clientData.resetTime = resetTime;
    }

    // Increment counter and check limit
    clientData.count++;
    if (clientData.count > RATE_LIMIT.max) {
      return cors(request, Response.json({ error: "Too many requests, please try again later." }, { status: 429 }));
    }
    
    // App proxy requests use HMAC validation, not sessions
    // Get shop domain from query params (validated by Shopify's HMAC)
    const storeShopDomain = url.searchParams.get('shop');
    
    if (!storeShopDomain) {
      console.error("Missing shop parameter");
      return cors(request, new Response(JSON.stringify({ error: "Missing shop parameter" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    
    // The HMAC signature in the URL params is already validated by Shopify
    // before the request reaches our app, so we can trust the shop domain

    // Get the data from the request body
    const requestData = await request.json();
    const validatedData = requestDataSchema.parse(requestData);
    const { userId, viewedProductData, customerOnProductPage } = validatedData;
    console.log('Customer currently on product page: ', customerOnProductPage);

    // Validate required data
    if (!userId) {
      console.error("Missing required data: userId");
    return cors(request, new Response(JSON.stringify({ error: "Missing required data: userId" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
    }));
    }
    
    // Retrieve the Voiceflow API key from environment
    const voiceflowApiKey = getVoiceflowApiKey();
    
    if (!validateVoiceflowApiKey(voiceflowApiKey)) {
      console.error(`No valid Voiceflow API key found for store: ${storeShopDomain}`);
      return cors(request, new Response(JSON.stringify({ error: "Voiceflow API key not configured" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // Prepare the variables to be updated in Voiceflow
    let variables: { [key: string]: any } = {
      customerOnProductPage: customerOnProductPage ? "true" : "false",
      //shouldClearState: "false"
    };

    // Only include viewedProductData and viewedProductTitle if on product page
    if (customerOnProductPage && viewedProductData) {
      variables.viewedProductData = viewedProductData;
      const parsedProductData = JSON.parse(viewedProductData);

      variables.viewedProductTitle =
        parsedProductData.variantTitle == "Default Title"
          ? parsedProductData.title
          : `${parsedProductData.title} - ${parsedProductData.variantTitle}`;
    }

    // Add productMessageClicked patch logic
    if (!customerOnProductPage) {
      variables.productMessageClicked = "false";
      variables.OOSMessageClicked = "false";
      variables.shouldClearState = "true";
    }

    // Make the API call to Voiceflow
    const voiceflowResponse = await fetch(
      `https://general-runtime.voiceflow.com/state/user/${userId}/variables`,
      {
        method: "PATCH",
        headers: {
          accept: "application/json",
          versionID: "production",
          "content-type": "application/json",
          Authorization: voiceflowApiKey, // Use the retrieved API key
        },
        body: JSON.stringify(variables),
      }
    );

    // Check for Voiceflow API errors
    if (!voiceflowResponse.ok) {
        const errorData = await voiceflowResponse.json();
        console.error("Voiceflow API error:", errorData);
        return cors(request, new Response(JSON.stringify({ error: `Voiceflow API error: ${voiceflowResponse.statusText}`, details: errorData }), {
            status: voiceflowResponse.status,
            headers: { 'Content-Type': 'application/json' }
        }));
    }

    // Return a success response
    console.log('Voiceflow variables updated successfully!');
    return cors(request, new Response(JSON.stringify({ success: true, message: "Voiceflow variables updated successfully" }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    }));

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return cors(request, new Response(JSON.stringify({ error: "An unexpected error occurred", details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    }));
  }
};

export const voiceflowRoute = () => {
  return { data: "123" };
};