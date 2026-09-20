import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  DeliveryMethod
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import { initializeDatabase } from "./init-db.server";

// Initialize database on startup
initializeDatabase();

/**
 * Automatically activate web pixel for cart attribution tracking
 * This ensures the web pixel is "connected" for every merchant installation
 */
async function activateWebPixel(session: any) {
  try {
    console.log(`[Web Pixel Activation] Attempting to activate for shop: ${session.shop}...`);
    
    // 1. Always try to CREATE the web pixel first.
    const settings = JSON.stringify({
      enabled: "true",
      app_url: process.env.SHOPIFY_APP_URL,
    });

    const createMutation = `
      mutation webPixelCreate($webPixel: WebPixelInput!) {
        webPixelCreate(webPixel: $webPixel) {
          userErrors { code field message }
          webPixel { id settings }
        }
      }
    `;
    const createVariables = { webPixel: { settings } };

    const createResponse = await fetch(`https://${session.shop}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': session.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: createMutation, variables: createVariables }),
    });
    
    const createResult = await createResponse.json();
    const userErrors = createResult.data?.webPixelCreate?.userErrors || [];

    // 2. Check for 'TAKEN' error. If it exists, the pixel is already there, so we update it.
    if (userErrors.some((error: any) => error.code === 'TAKEN')) {
      console.log('[Web Pixel Activation] Pixel already exists. Querying for ID to perform an update.');

      // Use the 'webPixel' query to get the ID of the pixel associated with this app.
      const webPixelQuery = `
        query {
          webPixel {
            id
          }
        }
      `;
      const queryResponse = await fetch(`https://${session.shop}/admin/api/${apiVersion}/graphql.json`, {
        method: 'POST',
        headers: { 'X-Shopify-Access-Token': session.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: webPixelQuery }),
      });
      const queryResult = await queryResponse.json();
      console.log('[Web Pixel Activation] All pixels query response:', JSON.stringify(queryResult, null, 2));
      const existingPixelId = queryResult.data?.webPixel?.id;

      if (!existingPixelId) {
        console.error('[Web Pixel Activation] Could not retrieve ID for existing pixel. Update failed.');
        return;
      }

      console.log(`[Web Pixel Activation] Found existing pixel ID: ${existingPixelId}. Preparing to update.`);
      const updateMutation = `
        mutation webPixelUpdate($id: ID!, $webPixel: WebPixelInput!) {
          webPixelUpdate(id: $id, webPixel: $webPixel) {
            userErrors { code field message }
            webPixel { id settings }
          }
        }
      `;
      const updateVariables = { id: existingPixelId, webPixel: { settings } };

      const updateResponse = await fetch(`https://${session.shop}/admin/api/${apiVersion}/graphql.json`, {
        method: 'POST',
        headers: { 'X-Shopify-Access-Token': session.accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: updateMutation, variables: updateVariables }),
      });

      const updateResult = await updateResponse.json();
      const updateResultData = updateResult.data?.webPixelUpdate;

      if (updateResultData?.userErrors?.length > 0) {
        console.error('[Web Pixel Activation] Update failed with errors:', updateResultData.userErrors);
      } else if (updateResultData?.webPixel) {
        console.log(`[Web Pixel Activation] ✅ Successfully updated pixel for ${session.shop}. ID:`, updateResultData.webPixel.id);
      } else {
        console.warn('[Web Pixel Activation] Unexpected response during update:', updateResult);
      }

    } else if (userErrors.length > 0) {
      // Handle other errors from the create attempt
      console.error('[Web Pixel Activation] Create failed with errors:', userErrors);
    
    } else if (createResult.data?.webPixelCreate?.webPixel) {
      // 3. If there were no errors, the creation was successful.
      console.log(`[Web Pixel Activation] ✅ Successfully created pixel for ${session.shop}. ID:`, createResult.data.webPixelCreate.webPixel.id);
    } else {
      console.warn('[Web Pixel Activation] Unexpected response during create:', createResult);
    }
    
  } catch (error) {
    console.error(`[Web Pixel Activation] Failed for shop ${session.shop}:`, error);
    // Don't throw - let the app installation continue even if web pixel fails
  }
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: ["read_products", "write_pixels", "read_pixels", "read_customer_events", "read_orders"],
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  // Each deployment is a single bespoke app installed on one client's store (never
  // App Store listed), so SingleMerchant is the accurate distribution type here.
  distribution: AppDistribution.SingleMerchant,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app.uninstalled",
    },
	APP_SCOPES_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app.scopes_update",
    },
    ORDERS_PAID: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/orders/paid",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
      
      // Automatically activate web pixel for cart attribution tracking
      await activateWebPixel(session);
    },
  },
  
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;

// Export the web pixel activation function for manual testing
export { activateWebPixel };
