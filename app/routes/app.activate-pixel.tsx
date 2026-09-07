import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { 
  Page, 
  Card, 
  Text, 
  Button, 
  BlockStack,
  Banner,
  InlineStack,
  Badge
} from "@shopify/polaris";
import { authenticate, activateWebPixel } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    
    console.log('[Web Pixel Activation Page] Calling activateWebPixel for shop:', session.shop);
    
    // Call the activateWebPixel function directly
    await activateWebPixel(session);
    
    return {
      success: true,
      message: 'Web Pixel activated successfully! Check Settings → Customer events in Shopify admin.',
      shop: session.shop
    };
    
  } catch (error: any) {
    console.error('[Web Pixel Activation Page] Failed:', error);
    return {
      success: false,
      message: 'Failed to activate Web Pixel',
      error: error.message
    };
  }
};

export default function ActivatePixelPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isActivating = navigation.state === "submitting";

  return (
    <Page
      title="Web Pixel Activation"
      subtitle="Activate your cart attribution tracking web pixel"
    >
      <BlockStack gap="400">
        {actionData?.success === true && (
          <Banner tone="success">
            <Text as="p">{actionData.message}</Text>
            {actionData.webPixelId && (
              <Text as="p">Web Pixel ID: {actionData.webPixelId}</Text>
            )}
          </Banner>
        )}
        
        {actionData?.success === false && (
          <Banner tone="critical">
            <BlockStack gap="200">
              <Text as="p">{actionData.message}</Text>
              {actionData.errors && (
                <Text as="p">Errors: {JSON.stringify(actionData.errors)}</Text>
              )}
              {actionData.error && (
                <Text as="p">Error: {actionData.error}</Text>
              )}
            </BlockStack>
          </Banner>
        )}

        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h2">
              Cart Attribution Web Pixel
            </Text>
            
            <Text as="p">
              Your cart attribution web pixel allows you to track when customers add products to their cart 
              after interacting with your AI chatbot. This helps measure the effectiveness of your chatbot 
              in driving conversions.
            </Text>
            
            <InlineStack gap="200" align="start">
              <Badge tone="info">Status</Badge>
              <Text as="p">
                {actionData?.success === true ? "✅ Connected" : "❌ Disconnected"}
              </Text>
            </InlineStack>
            
            <Form method="post">
              <Button
                submit
                loading={isActivating}
                variant="primary"
                disabled={actionData?.success === true}
              >
                {isActivating ? "Activating..." : 
                 actionData?.success === true ? "Already Activated" : 
                 "Activate Web Pixel"}
              </Button>
            </Form>
            
            <Text as="p" tone="subdued">
              After activation, go to Settings → Customer events in your Shopify admin to see the connected web pixel.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}