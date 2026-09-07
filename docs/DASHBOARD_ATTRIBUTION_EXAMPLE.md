# Dashboard Attribution Integration

## Fetching Attribution Stats

Add this to your dashboard route (e.g., `app/routes/app.dashboard.tsx`):

```typescript
// In your loader function
export const loader: LoaderFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // Fetch attribution stats
  const attributionResponse = await fetch(
    `${process.env.SHOPIFY_APP_URL}/api/voiceflow?action=getAttributionStats&shop=${session.shop}&days=30`
  );
  
  const attributionStats = await attributionResponse.json();
  
  return json({
    // ... other dashboard data
    attributionStats
  });
};
```

## Displaying in Dashboard

```tsx
// In your dashboard component
const { attributionStats } = useLoaderData();

// Display the KPI
<Card>
  <Card.Section>
    <Text variant="headingMd" as="h2">
      Checkouts Started After Chat Interaction
    </Text>
    <Text variant="heading2xl" as="p">
      {attributionStats.total}
    </Text>
    <Text variant="bodyMd" as="p" color="subdued">
      Last 30 days
    </Text>
  </Card.Section>
  
  {attributionStats.breakdown && (
    <Card.Section>
      <Stack vertical spacing="tight">
        <Text variant="headingSm">Breakdown by Type:</Text>
        {Object.entries(attributionStats.breakdown).map(([type, count]) => (
          <Text key={type} variant="bodyMd">
            {type}: {count}
          </Text>
        ))}
      </Stack>
    </Card.Section>
  )}
</Card>
```

## Real-time Updates (Optional)

For live updates without refresh:

```tsx
// Poll for updates every 30 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch(
      `/api/voiceflow?action=getAttributionStats&shop=${shop}&days=30`
    );
    const data = await response.json();
    setAttributionStats(data);
  }, 30000);
  
  return () => clearInterval(interval);
}, [shop]);
```

## Available Attribution Types

The system tracks these attribution types:
- `same_session` - Checkout in same session as chat
- `local_anonymous` - Anonymous user, same device, within 5 days
- `local_identified` - Logged-in user, same device, within 5 days
- `klaviyo_tracked` - Cross-device attribution via Klaviyo (from Voiceflow)

## API Endpoints

### Get Attribution Stats
```
GET /api/voiceflow?action=getAttributionStats&shop=SHOP_DOMAIN&days=30
```

Response:
```json
{
  "total": 42,
  "breakdown": {
    "same_session": 15,
    "local_anonymous": 20,
    "local_identified": 5,
    "klaviyo_tracked": 2
  },
  "period": "30 days"
}
```

### Track Attribution (Called Automatically)
```
POST /api/voiceflow?action=trackChatAttribution&shop=SHOP_DOMAIN
```

Body:
```json
{
  "attributionType": "local_anonymous",
  "eventType": "checkout_started",
  "userId": "user_123",
  "cartValue": 99.99,
  "daysSinceInteraction": 2.5,
  "interactionCount": 3
}
```
