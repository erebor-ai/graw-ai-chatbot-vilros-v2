# Attribution Tracking - Voiceflow Integration Guide

## Overview
The attribution system has two components:
1. **Local Tracking** (handled by `simple-attribution-tracker.js`) - For anonymous same-device users
2. **Klaviyo Tracking** (handled in Voiceflow) - For identified users with email

## Voiceflow Functions to Add

### 1. Create Klaviyo Event When Chat Starts
Add this to your Voiceflow workflow when a chat starts AND you have the user's email:

```javascript
// Function: createChatbotInteractionEvent
// Trigger: When chat starts and email is known
export default async function main(args) {
  const { email, klaviyoAPI, pageUrl, productTitle } = args.inputVars;
  
  if (!email) {
    return { success: false, reason: 'No email available' };
  }
  
  const eventData = {
    data: {
      type: "event",
      attributes: {
        profile: {
          data: {
            type: "profile",
            attributes: {
              email: email
            }
          }
        },
        metric: {
          data: {
            type: "metric",
            attributes: {
              name: "Chatbot Interaction"
            }
          }
        },
        properties: {
          timestamp: new Date().toISOString(),
          chatStarted: true,
          pageUrl: pageUrl || "",
          productViewed: productTitle || ""
        }
      }
    }
  };
  
  try {
    const response = await fetch('https://a.klaviyo.com/api/events/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Klaviyo-API-Key ${klaviyoAPI}`,
        'revision': '2025-01-15'
      },
      body: JSON.stringify(eventData)
    });
    
    return { 
      success: response.ok,
      message: 'Chatbot interaction event created'
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

### 2. Augment Your Existing getKlaviyoData Function

Add this section to check for attribution in your existing function:

```javascript
// Add this section after getting customer order history
// Check for chatbot interactions within attribution window

const checkChatbotAttribution = async (klaviyoProfileId, klaviyoAPI) => {
  try {
    // Step 1: Get all metrics to find the IDs we need
    const metricsResponse = await fetch('https://a.klaviyo.com/api/metrics?fields[metric]=name', {
      method: 'GET',
      headers: {
        accept: 'application/vnd.api+json',
        revision: '2025-01-15',
        Authorization: `Klaviyo-API-Key ${klaviyoAPI}`
      }
    });
    
    if (!metricsResponse.ok) {
      console.error('Failed to fetch metrics');
      return null;
    }
    
    const metricsData = await metricsResponse.json();
    
    // Find the metric IDs we need
    const chatbotInteractionMetric = metricsData.data.find(metric => 
      metric.attributes.name === 'Chatbot Interaction'
    );
    
    const checkoutStartedMetric = metricsData.data.find(metric => 
      metric.attributes.name === 'Checkout Started'  // Corrected name
    );
    
    if (!checkoutStartedMetric) {
      console.log('Checkout Started metric not found');
      return null;
    }
    
    // Step 2: Get events from the last 5 days
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    
    // Build filter for events
    let eventFilters = `equals(profile_id,"${klaviyoProfileId}"),greater-or-equal(datetime,${fiveDaysAgo})`;
    
    // Get checkout events
    const checkoutEventsUrl = `https://a.klaviyo.com/api/events?filter=${eventFilters},equals(metric_id,"${checkoutStartedMetric.id}")`;
    
    const checkoutResponse = await fetch(checkoutEventsUrl, {
      method: 'GET',
      headers: {
        accept: 'application/vnd.api+json',
        revision: '2025-01-15',
        Authorization: `Klaviyo-API-Key ${klaviyoAPI}`
      }
    });
    
    if (!checkoutResponse.ok) {
      console.error('Failed to fetch checkout events');
      return null;
    }
    
    const checkoutEvents = await checkoutResponse.json();
    
    // Get chatbot interaction events (if metric exists)
    let chatInteractionEvents = { data: [] };
    if (chatbotInteractionMetric) {
      const chatEventsUrl = `https://a.klaviyo.com/api/events?filter=${eventFilters},equals(metric_id,"${chatbotInteractionMetric.id}")`;
      
      const chatResponse = await fetch(chatEventsUrl, {
        method: 'GET',
        headers: {
          accept: 'application/vnd.api+json',
          revision: '2025-01-15',
          Authorization: `Klaviyo-API-Key ${klaviyoAPI}`
        }
      });
      
      if (chatResponse.ok) {
        chatInteractionEvents = await chatResponse.json();
      }
    }
    
    // Step 3: Check for attribution (chat before checkout within 5 days)
    let hasAttribution = false;
    let attributionDetails = null;
    
    if (chatInteractionEvents.data.length > 0 && checkoutEvents.data.length > 0) {
      for (const checkout of checkoutEvents.data) {
        const checkoutTime = new Date(checkout.attributes.datetime);
        
        for (const interaction of chatInteractionEvents.data) {
          const interactionTime = new Date(interaction.attributes.datetime);
          const daysBetween = (checkoutTime - interactionTime) / (1000 * 60 * 60 * 24);
          
          // Chat must happen BEFORE checkout and within 5 days
          if (daysBetween >= 0 && daysBetween <= 5) {
            hasAttribution = true;
            attributionDetails = {
              checkoutDate: checkoutTime.toISOString(),
              interactionDate: interactionTime.toISOString(),
              daysBetween: daysBetween.toFixed(2)
            };
            break;
          }
        }
        if (hasAttribution) break;
      }
    }
    
    return {
      hasRecentChatInteraction: chatInteractionEvents.data.length > 0,
      lastChatInteraction: chatInteractionEvents.data[0]?.attributes.datetime,
      hasRecentCheckout: checkoutEvents.data.length > 0,
      lastCheckout: checkoutEvents.data[0]?.attributes.datetime,
      hasAttributedCheckout: hasAttribution,
      attributionDetails: attributionDetails
    };
    
  } catch (error) {
    console.error('Error checking chatbot attribution:', error);
    return null;
  }
};

// Call this function and add to klaviyoPayload
const attributionData = await checkChatbotAttribution(klaviyoProfileId, klaviyoAPI);

// Add to your existing klaviyoPayload
klaviyoPayload.chatbotAttribution = attributionData;
```

## Frontend Events Available

The frontend fires these events that you can listen for in Voiceflow:

1. **`chatbotWidgetOpened`** - When user clicks to open the chat widget
   ```javascript
   // Event detail:
   {
     timestamp: "2024-03-25T10:00:00Z",
     userId: "user_xyz123"
   }
   ```

2. **`grawCheckoutWithConversation`** - When checkout is initiated with ongoing conversation
   ```javascript
   // Event detail:
   {
     sessionId: "session_123",
     userId: "user_xyz123",
     conversationOngoing: true,
     cartValue: 99.99
   }
   ```

3. **`chatAttributedCheckout`** - When checkout is attributed to a chat interaction
   ```javascript
   // Event detail:
   {
     daysSinceInteraction: 2.5,
     interactionCount: 3
   }
   ```

## Testing

1. **Test Anonymous Attribution**:
   - Clear localStorage
   - Open chat widget (interaction recorded)
   - Click checkout within 5 days
   - Check console for "Checkout attributed to chat!"

2. **Test Klaviyo Attribution**:
   - Login with email
   - Open chat (should create Klaviyo event)
   - Make purchase within 5 days
   - Check Klaviyo dashboard for "Chatbot Interaction" event

## Dashboard Integration

The attribution data is sent to `/api/voiceflow?action=trackChatAttribution` with:
```json
{
  "attributed": true,
  "attributionType": "local_anonymous",
  "daysSinceInteraction": 2.5,
  "interactionCount": 3,
  "firstInteraction": "2024-03-23T10:00:00Z",
  "lastInteraction": "2024-03-25T14:00:00Z"
}
```

You can store and aggregate this data for dashboard display.
