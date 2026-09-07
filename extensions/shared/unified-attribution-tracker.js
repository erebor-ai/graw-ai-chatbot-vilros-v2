// unified-attribution-tracker.js
/**
 * Unified Attribution Tracker
 * 
 * This module provides a centralized system for tracking attribution across
 * different events (cart additions, checkouts, searches, sales, etc.)
 * 
 * Features:
 * - DRY principle: Single source of truth for attribution logic
 * - Multiple event types with configurable attribution windows
 * - Consistent conversation state management
 * - Scalable for future attribution events
 */
(function() {
  'use strict';

  const UnifiedAttributionTracker = {
    // Configuration for different attribution events
    config: {
      // Attribution windows (in milliseconds)
      attributionWindows: {
        'checkout_started': 3 * 24 * 60 * 60 * 1000, // 72 hours
        'add_to_cart': 3 * 24 * 60 * 60 * 1000, // 72 hours 
        'search_submitted': 3 * 24 * 60 * 60 * 1000, // 72 hours   
        'checkout_completed': 3 * 24 * 60 * 60 * 1000, // 72 hours 
        'sale_completed': 3 * 24 * 60 * 60 * 1000 // 72 hours 
      },
      
      // API endpoint for attribution tracking
      apiEndpoint: '/apps/voiceflow',
      
      // Storage keys
      storageKeys: {
        conversationOngoing: 'graw_conversation_ongoing',
        widgetOpen: 'graw_widget_open',
        sessionId: 'graw_session_id',
        userId: 'graw_user_id',
        chatAttribution: 'graw_chat_attribution'
      }
    },

    /**
     * Initialize the attribution tracker
     */
    init: function() {
      GrawLogger.log('GRAW AI: Unified Attribution Tracker initialized');
      this.initializeSession();
    },

    /**
     * Initialize or retrieve session ID
     */
    initializeSession: function() {
      let sessionId = sessionStorage.getItem(this.config.storageKeys.sessionId);
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem(this.config.storageKeys.sessionId, sessionId);
      }
      return sessionId;
    },

    /**
     * Get comprehensive conversation state
     * This is the core logic extracted from checkout-tracking.js
     */
    getConversationState: function() {
      try {
        // Check if conversation is currently ongoing
        const isOngoing = this.checkIfConversationOngoing();
        
        if (isOngoing) {
          return {
            hasRecentInteraction: true,
            isOngoing: true,
            userId: this.getUserId(),
            sessionId: this.getSessionId(),
            firstInteraction: null, // Will be filled by stored data if available
            lastInteraction: null,  // Will be filled by stored data if available
            interactionCount: null, // Will be filled by stored data if available
            daysSinceInteraction: null // Will be calculated
          };
        }
        
        // Check for recent interactions within attribution windows
        const storedData = this.getStoredInteractionData();
        if (storedData && storedData.lastInteraction) {
          const hoursSinceInteraction = 
            (Date.now() - new Date(storedData.lastInteraction).getTime()) / (1000 * 60 * 60);
          
          // Check against the longest attribution window (7 days for sales)
          const maxWindowHours = Math.max(...Object.values(this.config.attributionWindows)) / (1000 * 60 * 60);
          
          if (hoursSinceInteraction <= maxWindowHours) {
            return {
              hasRecentInteraction: true,
              isOngoing: false,
              userId: storedData.userId,
              sessionId: storedData.sessionId,
              firstInteraction: storedData.firstInteraction,
              lastInteraction: storedData.lastInteraction,
              interactionCount: storedData.interactionCount,
              daysSinceInteraction: hoursSinceInteraction / 24
            };
          }
        }
        
        return { hasRecentInteraction: false };
        
      } catch (error) {
        GrawLogger.error('GRAW AI: Error getting conversation state:', error);
        return { hasRecentInteraction: false };
      }
    },

    /**
     * Check if conversation is currently ongoing
     * Logic from checkout-tracking.js
     */
    checkIfConversationOngoing: function() {
      try {
        // Primary: read Voiceflow session directly (most accurate)
        if (typeof ConversationStateManager !== 'undefined' && 
            ConversationStateManager.hasOngoingConversation) {
          return ConversationStateManager.hasOngoingConversation() || 
                ConversationStateManager.isWidgetOpen();
        }
        // Fallback: stored property (updated by setInterval)
        if (typeof window.ConversationStateManager !== 'undefined') {
          return window.ConversationStateManager.isConversationOngoing || 
                window.ConversationStateManager.isWidgetOpen();
        }
        return sessionStorage.getItem('graw_conversation_ongoing') === 'true';
      } catch (error) {
        return false;
      }
    },

    /**
     * Get stored interaction data from localStorage
     */
    getStoredInteractionData: function() {
      try {
        const stored = localStorage.getItem(this.config.storageKeys.chatAttribution);
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        return null;
      }
    },

    /**
     * Get user ID from various sources
     */
    getUserId: function() {
      try {
        // Try to get from UserIdentifier (from checkout-tracking.js)
        if (typeof UserIdentifier !== 'undefined' && UserIdentifier.getUserId) {
          return UserIdentifier.getUserId();
        }
        
        // Fallback to sessionStorage
        return sessionStorage.getItem(this.config.storageKeys.userId) || 'unknown';
      } catch (error) {
        return 'unknown';
      }
    },

    /**
     * Get session ID
     */
    getSessionId: function() {
      try {
        return sessionStorage.getItem(this.config.storageKeys.sessionId) || null;
      } catch (error) {
        return null;
      }
    },

    /**
     * Get customer data (from checkout-tracking.js)
     */
    getCustomerEmail: function() {
      return window.customerData?.customer?.email || 
             window.Shopify?.customer?.email ||
             sessionStorage.getItem('graw_customer_email') ||
             null;
    },

    getCustomerId: function() {
      return window.customerData?.customer?.id || 
             window.Shopify?.customer?.id ||
             sessionStorage.getItem('graw_customer_id') ||
             null;
    },

    /**
     * Get shop domain
     */
    getShopDomain: function() {
      try {
        let shopDomain = window.GRAW_AI_SETTINGS?.shopDomain || 
                        window.Shopify?.shop || 
                        sessionStorage.getItem('graw_shop_domain');
        
        if (!shopDomain) {
          const hostname = window.location.hostname;
          if (hostname.includes('.myshopify.com')) {
            shopDomain = hostname;
          } else {
            shopDomain = hostname;
          }
        }
        
        return shopDomain;
      } catch (error) {
        return 'unknown-shop';
      }
    },

    /**
     * Check if event should be attributed based on conversation state and attribution window
     */
    shouldAttributeEvent: function(eventType) {
      const conversationState = this.getConversationState();
      
      if (!conversationState.hasRecentInteraction) {
        return { shouldAttribute: false, reason: 'No recent interaction' };
      }

      // If conversation is ongoing, always attribute
      if (conversationState.isOngoing) {
        return { 
          shouldAttribute: true, 
          attributionType: 'ongoing_conversation',
          conversationState 
        };
      }

      // Check attribution window for this event type
      const attributionWindow = this.config.attributionWindows[eventType];
      if (!attributionWindow) {
        GrawLogger.warn(`GRAW AI: No attribution window defined for event type: ${eventType}`);
        return { shouldAttribute: false, reason: 'No attribution window defined' };
      }

      const hoursSinceInteraction = conversationState.daysSinceInteraction * 24;
      const windowHours = attributionWindow / (1000 * 60 * 60);

      if (hoursSinceInteraction <= windowHours) {
        return { 
          shouldAttribute: true, 
          attributionType: 'within_window',
          conversationState 
        };
      }

      return { 
        shouldAttribute: false, 
        reason: `Outside attribution window (${hoursSinceInteraction.toFixed(1)}h > ${windowHours}h)` 
      };
    },

    /**
     * Track an attribution event
     */
    trackEvent: function(eventType, eventData = {}) {
      GrawLogger.log(`GRAW AI: Tracking ${eventType} event`, eventData);

      const attributionCheck = this.shouldAttributeEvent(eventType);
      
      if (!attributionCheck.shouldAttribute) {
        GrawLogger.log(`GRAW AI: ${eventType} not attributed - ${attributionCheck.reason}`);
        return;
      }

      GrawLogger.log(`GRAW AI: Attributing ${eventType} to chat interaction (${attributionCheck.attributionType})`);

      const attributionData = {
        eventType: eventType,
        attributionType: attributionCheck.attributionType,
        timestamp: new Date().toISOString(),
        conversationOngoing: attributionCheck.conversationState.isOngoing,
        userId: attributionCheck.conversationState.userId,
        sessionId: attributionCheck.conversationState.sessionId,
        shopDomain: this.getShopDomain(),
        customerEmail: this.getCustomerEmail(),
        customerId: this.getCustomerId(),
        firstInteraction: attributionCheck.conversationState.firstInteraction,
        lastInteraction: attributionCheck.conversationState.lastInteraction,
        interactionCount: attributionCheck.conversationState.interactionCount,
        daysSinceInteraction: attributionCheck.conversationState.daysSinceInteraction,
        ...eventData // Merge in event-specific data
      };

      // Send to API
      this.sendToAPI(eventType, attributionData);

      // Fire custom event for other scripts to listen to
      window.dispatchEvent(new CustomEvent(`grawAttribution${this.capitalizeFirst(eventType)}`, { 
        detail: attributionData 
      }));
    },

    /**
     * Send attribution data to API
     */
    sendToAPI: function(eventType, data) {
      try {
        const actionMap = {
          'checkout_started': 'trackCheckout',
          'add_to_cart': 'trackAddToCart',
          'search_submitted': 'trackSearch',
          'checkout_completed': 'trackSale',
          'sale_completed': 'trackSale'
        };

        const action = actionMap[eventType] || 'trackChatAttribution';
        const endpoint = `${this.config.apiEndpoint}?action=${action}&shop=${data.shopDomain}`;
        
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          keepalive: true
        })
        .then(response => {
          if (response.ok) {
            GrawLogger.log(`GRAW AI: ${eventType} attribution sent successfully`);
          } else {
            GrawLogger.warn(`GRAW AI: Failed to send ${eventType} attribution`);
          }
        })
        .catch(error => {
          GrawLogger.error(`GRAW AI: Error sending ${eventType} attribution:`, error);
        });
      } catch (error) {
        GrawLogger.error(`GRAW AI: Error in sendToAPI for ${eventType}:`, error);
      }
    },

    /**
     * Helper function to capitalize first letter
     */
    capitalizeFirst: function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  };

  // Initialize the tracker
  UnifiedAttributionTracker.init();

  // Export for use by other scripts
  window.UnifiedAttributionTracker = UnifiedAttributionTracker;
})();