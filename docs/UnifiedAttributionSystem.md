# Unified Attribution System

## Overview

The Unified Attribution System follows DRY principles by centralizing all attribution logic into reusable modules. This system tracks various customer actions (cart additions, checkouts, searches, sales) and attributes them to chatbot interactions when they occur within defined time windows.

## Architecture

### Core Components

1. **UnifiedAttributionTracker** (`extensions/shared/unified-attribution-tracker.js`)
   - Central attribution logic module
   - Handles conversation state management
   - Configurable attribution windows for different events
   - API communication layer

2. **Web Pixel** (`extensions/cart-attribution-pixel/src/index.ts`)
   - Uses Shopify Web Pixels API
   - Tracks `product_added_to_cart` events
   - Embeds UnifiedAttributionTracker logic for consistent behavior

3. **Checkout Tracker** (`extensions/shared/checkout-tracker.js`)
   - Event listener for checkout button clicks
   - Uses UnifiedAttributionTracker for attribution logic
   - Will eventually be replaced by web pixel implementation

## Attribution Events & Windows

```javascript
const attributionEvents = {
  'checkout_started': { window: 24 * 60 * 60 * 1000 }, // 24 hours
  'add_to_cart': { window: 24 * 60 * 60 * 1000 }, // 24 hours
  'search_submitted': { window: 24 * 60 * 60 * 1000 }, // 24 hours  
  'checkout_completed': { window: 7 * 24 * 60 * 60 * 1000 }, // 7 days
  'sale_completed': { window: 7 * 24 * 60 * 60 * 1000 } // 7 days
}
```

## Usage Examples

### Track Cart Addition (Web Pixel)
```javascript
// Automatically handled by the web pixel when Shopify fires product_added_to_cart
analytics.subscribe('product_added_to_cart', (event) => {
  handleCartAttribution(event);
});
```

### Track Checkout (Event Listener)
```javascript
// Automatically handled by checkout tracker
window.UnifiedAttributionTracker.trackEvent('checkout_started', {
  cartValue: 199.99,
  itemCount: 3,
  customerEmail: 'customer@example.com'
});
```

### Future Events (Extensible)
```javascript
// Example for tracking searches after bot interaction
window.UnifiedAttributionTracker.trackEvent('search_submitted', {
  searchQuery: 'red dress',
  resultCount: 42
});

// Example for tracking completed sales
window.UnifiedAttributionTracker.trackEvent('sale_completed', {
  orderId: 'ORDER_123',
  orderValue: 299.99,
  orderDate: '2025-01-15T10:30:00Z'
});
```

## Attribution Logic

The system determines whether to attribute an event based on:

1. **Ongoing Conversation**: If the chatbot widget is currently open or a conversation is active
2. **Time Window**: If the event occurs within the defined attribution window after a chat interaction
3. **Attribution Type**: 
   - `ongoing_conversation` - Chat is currently active
   - `within_window` - Event occurred within the attribution window

## API Integration

All attribution data is sent to:
```
POST /apps/voiceflow?action=trackAddToCart&shop={shopDomain}
POST /apps/voiceflow?action=trackCheckout&shop={shopDomain}
POST /apps/voiceflow?action=trackSearch&shop={shopDomain}
POST /apps/voiceflow?action=trackSale&shop={shopDomain}
```

The API handler in `app/routes/api.voiceflow.tsx` processes these requests and stores them in the database.

## Database Schema

Attribution data is stored in the `attributionTracking` table:
- `eventType`: 'add_to_cart', 'checkout_started', 'search_submitted', 'sale_completed'
- `attributionType`: 'ongoing_conversation', 'within_window'
- `userId`, `sessionId`, `customerId`, `customerEmail`
- `metadata`: JSON field for event-specific data (product details, search queries, etc.)

## Dashboard Integration

The dashboard (`app/routes/app.dashboard.tsx`) displays:
- **Cart Attribution Metrics**: Charts and KPIs for attributed cart additions
- **Checkout Attribution Metrics**: Charts and KPIs for attributed checkouts  
- **Future Metrics**: Ready for search attribution, sale attribution, etc.

## Web Pixel Activation

To activate the web pixel:
1. Navigate to `/apps/activate-pixel` in your Shopify app admin
2. Click "Activate Web Pixel"
3. Verify in Shopify Admin: Settings → Customer events

## Benefits

1. **DRY Principle**: Single source of truth for attribution logic
2. **Consistency**: All events use the same attribution rules
3. **Scalability**: Easy to add new attribution events
4. **Maintainability**: Changes to attribution logic update all tracking
5. **Flexibility**: Mix of web pixels and event listeners as needed

## Migration Path

**Current State**: 
- Cart attribution: ✅ Web Pixel (Shopify API)
- Checkout attribution: Event listener (will migrate to web pixel)

**Future State**:
- All attribution events: Web Pixels for maximum reliability
- Unified configuration and logic across all events

## File Structure

```
extensions/
├── shared/
│   ├── unified-attribution-tracker.js    # Core attribution logic
│   └── checkout-tracker.js               # Simplified checkout tracking
├── cart-attribution-pixel/
│   └── src/index.ts                      # Web pixel for cart events
└── graw-embed-extension/
    └── assets/checkout-tracking.js       # Legacy (to be replaced)
```

## Development Notes

- Web pixels have limited import capabilities, so the UnifiedAttributionTracker is embedded inline
- The system is designed to be backwards compatible with existing tracking
- All attribution events fire custom DOM events for additional integrations
- The API handles deduplication to prevent duplicate attribution records