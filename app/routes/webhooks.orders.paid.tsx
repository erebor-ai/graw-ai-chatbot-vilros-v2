// app/routes/webhooks.orders.paid.tsx
// Server-side fallback for checkout attribution: fires on Shopify's order/paid event,
// independent of any client-side script, pixel consent, or other apps' bugs.
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { data } from "@remix-run/node";
import prisma from "../db.server";

export const loader: LoaderFunction = async () => {
  return data(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
};

// Reads the graw_* cart attributes written client-side by cart-attribution-bridge.js,
// which Shopify carries through onto the order as note_attributes.
function extractAttribution(noteAttributes: Array<{ name: string; value: string }> | undefined) {
  const map = new Map((noteAttributes || []).map((attr) => [attr.name, attr.value]));
  const interactionCountRaw = map.get("graw_interaction_count");

  return {
    userId: map.get("graw_user_id") || null,
    sessionId: map.get("graw_session_id") || null,
    attributionType: map.get("graw_attribution_type") || null,
    lastInteraction: map.get("graw_last_interaction") || null,
    firstInteraction: map.get("graw_first_interaction") || null,
    interactionCount: interactionCountRaw ? parseInt(interactionCountRaw, 10) : null,
  };
}

export const action: ActionFunction = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  if (topic !== "ORDERS_PAID") {
    console.warn(`Unhandled webhook topic: ${topic}`);
    return data(JSON.stringify({ error: "Unhandled webhook topic" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const order = payload as any;
    const attribution = extractAttribution(order.note_attributes);

    // No attribution attributes on the order means this checkout wasn't linked to a conversation.
    if (!attribution.userId && !attribution.sessionId) {
      return data(null, { status: 200 });
    }

    // Avoid double-counting when the Web Pixel's checkout_completed already recorded this order.
    const existing = await prisma.attributionTracking.findFirst({
      where: {
        shopDomain: shop,
        eventType: "checkout_completed",
        createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
        OR: [
          ...(attribution.sessionId ? [{ sessionId: attribution.sessionId }] : []),
          ...(attribution.userId ? [{ userId: attribution.userId }] : []),
        ],
      },
    });

    if (existing) {
      console.log(`[Orders Paid Webhook] Order ${order.id} already attributed via pixel, skipping duplicate`);
      return data(null, { status: 200 });
    }

    const daysSinceInteraction = attribution.lastInteraction
      ? (Date.now() - new Date(attribution.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
      : null;

    await prisma.attributionTracking.create({
      data: {
        shopDomain: shop,
        attributionType: attribution.attributionType || "within_window",
        eventType: "checkout_completed",
        userId: attribution.userId,
        // Deliberately not reading order.customer/order.email: the dashboard never uses
        // customerId/customerEmail, and omitting them keeps this at Shopify's protected
        // customer data Level 1 (order data) instead of Level 2 (name/email/phone/address).
        sessionId: attribution.sessionId,
        cartValue: order.total_price ? parseFloat(order.total_price) : null,
        daysSinceInteraction,
        interactionCount: attribution.interactionCount,
        firstInteraction: attribution.firstInteraction ? new Date(attribution.firstInteraction) : null,
        lastInteraction: attribution.lastInteraction ? new Date(attribution.lastInteraction) : null,
        metadata: JSON.stringify({
          orderId: order.id,
          orderNumber: order.order_number,
          currency: order.currency,
          source: "orders_paid_webhook",
        }),
      },
    });

    console.log(`[Orders Paid Webhook] Recorded chatbot-attributed order ${order.id} for ${shop}`);
    return data(null, { status: 200 });
  } catch (error: any) {
    console.error(`Error handling ORDERS_PAID webhook for ${shop}:`, error);
    return data(JSON.stringify({ error: "Failed to process orders/paid webhook" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
