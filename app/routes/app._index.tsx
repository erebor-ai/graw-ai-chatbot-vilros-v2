import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  List,
  Link,
  Box,
  Divider,
  Icon,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {
  QuestionCircleIcon,
  SettingsIcon,
  ChatIcon,
} from "@shopify/polaris-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return JSON.stringify({});
};

export default function Index() {
  useAppBridge();

  return (
    <Page>
      <TitleBar title="Welcome to GRAW AI Chatbot" />
      <BlockStack gap="500">
        {/* --- Main Introduction Section --- */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingXl" as="h1">
                  🚀 Elevate Your Customer Experience with GRAW AI
                </Text>
                <Text variant="bodyLg" as="p">
                  Welcome! GRAW AI provides an intelligent, human-like AI chatbot designed specifically for your Shopify store. Our chatbot enhances your customer service by:
                </Text>
                <BlockStack gap="200">
                  <InlineStack gap="300" blockAlign="start">
                    <Box>
                      <Icon source={ChatIcon} tone="base" />
                    </Box>
                    <Text variant="bodyMd" as="p">Answering customer questions organically and naturally.</Text>
                  </InlineStack>
                  <InlineStack gap="300" blockAlign="start">
                    <Box>
                      <Icon source={ChatIcon} tone="base" />
                    </Box>
                    <Text variant="bodyMd" as="p">Providing smart product recommendations.</Text>
                  </InlineStack>
                  <InlineStack gap="300" blockAlign="start">
                    <Box>
                      <Icon source={ChatIcon} tone="base" />
                    </Box>
                    <Text variant="bodyMd" as="p">Assisting with order actions and providing expert help.</Text>
                  </InlineStack>
                  <InlineStack gap="300" blockAlign="start">
                    <Box>
                      <Icon source={ChatIcon} tone="base" />
                    </Box>
                    <Text variant="bodyMd" as="p">Seamlessly switching between tasks for a smooth, single-conversation feel.</Text>
                  </InlineStack>
                </BlockStack>
                <Text variant="bodyMd" as="p">
                  Our goal is to make your customers feel heard and valued, boosting satisfaction and sales.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Divider borderColor="border-secondary" />

        {/* --- Getting Started Section --- */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                {/* Fixed Heading Structure */}
                <InlineStack gap="200" blockAlign="center" wrap={false}>
                  <Text variant="headingLg" as="h2">
                  ⚙️ Getting Started: Activate Your AI Chatbot
                  </Text>
                </InlineStack>
                <Text variant="bodyMd" as="p">
                  GRAW AI integrates directly into your Shopify theme as an embedded app. To activate and customize your chatbot, please follow these simple steps:
                </Text>
                <List type="number">
                  <List.Item>
                    Go to your Shopify Admin dashboard.
                  </List.Item>
                  <List.Item>
                    Navigate to{" "}
                    <Text as="span" fontWeight="semibold">
                      Online Store &gt; Themes
                    </Text>.
                  </List.Item>
                  <List.Item>
                    Find your current theme and click the{" "}
                    <Text as="span" fontWeight="semibold">
                      Customize
                    </Text>{" "}
                    button.
                  </List.Item>
                  <List.Item>
                    In the Theme Editor sidebar (usually on the left), look for the{" "}
                    <Text as="span" fontWeight="semibold">
                      App embeds
                    </Text>{" "}
                    section. You might find this under an icon resembling a puzzle piece, or sometimes within 'Theme settings'.
                  </List.Item>
                  <List.Item>
                    Find "<Text as="span" fontWeight="semibold">GRAW AI Chatbot</Text>" in the list of available app embeds.
                  </List.Item>
                  <List.Item>
                    Enable it using the toggle switch next to its name.
                  </List.Item>
                  <List.Item>
                    Once enabled, you can click on "<Text as="span" fontWeight="semibold">GRAW AI Chatbot</Text>" (or the arrow next to it) in the app embeds list to expand its settings. Here, you can configure the chatbot's appearance, behavior, and other preferences to perfectly match your brand.
                  </List.Item>
                </List>
                <Box paddingBlockStart="200">
                  <Text variant="bodyMd" as="p">
                    That's it! Your AI-powered chatbot will then be live on your store, ready to engage with your customers.
                  </Text>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* --- Support Section --- */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                {/* Fixed Heading Structure */}
                <InlineStack gap="200" blockAlign="center" wrap={false}>
                 <Text variant="headingMd" as="h2">
                 Need Help?
                 </Text>
                </InlineStack>
                <Text variant="bodyMd" as="p">
                  We're here to ensure you get the most out of GRAW AI. If you have any questions, need assistance with setup, or have feedback, please don't hesitate to reach out.
                </Text>
                <BlockStack gap="100">
                  <Text variant="bodyMd" as="p">
                    Visit our website:{" "}
                    <Link url="https://graw.ai" target="_blank" removeUnderline>
                      graw.ai
                    </Link>
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Email us:{" "}
                    <Link url="mailto:jack@graw.ai" removeUnderline>
                      jack@graw.ai
                    </Link>{" "}
                    or{" "}
                    <Link url="mailto:chris@graw.ai" removeUnderline>
                      chris@graw.ai
                    </Link>
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Box paddingBlockStart="400" paddingBlockEnd="400">
            <Text alignment="center" variant="bodySm" tone="subdued" as="p">
                Thank you for choosing GRAW AI to power your customer interactions!
            </Text>
        </Box>

      </BlockStack>
    </Page>
  );
}