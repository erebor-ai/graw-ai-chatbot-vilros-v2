import { LoaderFunctionArgs, json } from "@remix-run/node";
import shopify, { activateWebPixel } from "../shopify.server";

/**
 * DEVELOPER BACKDOOR
 * Use this to force pixel activation remotely.
 * URL: https://your-app-url.com/api/remote-activate?shop=client-store.myshopify.com&secret=YOUR_SECRET
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const secret = url.searchParams.get("secret");

  // Define a secret in your Fly.io environment variables: REMOTE_ACTIVATE_SECRET
  const devSecret = process.env.REMOTE_ACTIVATE_SECRET;
  
  if (!devSecret || secret !== devSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400 });
  }

  try {
    // Find the stored session for this shop
    const sessions = await shopify.sessionStorage.findSessionsByShop(shop);
    
    // We prefer the offline session if available
    const session = sessions.find(s => !s.expires || s.isOnline === false) || sessions[0];

    if (!session) {
      return json({ error: `No stored session found for shop: ${shop}` }, { status: 404 });
    }

    console.log(`[Remote Backdoor] Manually triggering pixel activation for: ${shop}`);
    await activateWebPixel(session);

    return json({ 
      success: true, 
      message: `Web Pixel activation logic executed for ${shop}. Check Shopify Admin settings.` 
    });
  } catch (error: any) {
    console.error(`[Remote Backdoor] Failed for ${shop}:`, error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};