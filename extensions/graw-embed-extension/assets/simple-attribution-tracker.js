// simple-attribution-tracker.js
// Local attribution tracker for anonymous same-device users
// Works alongside Klaviyo tracking for known users (handled in Voiceflow)

(function() {
  'use strict';
  
  const SimpleAttributionTracker = {
    config: {
      attributionWindowDays: 3, // 72 hours
      storageKey: 'graw_chat_attribution',
      endpoint: '/apps/voiceflow',
      sendToBackend: true, // Required to store in SQLite for dashboard metrics
      debounceTime: 5 * 60 * 1000, // 5 minutes between interaction records
      checkInterval: 30000 // 30 seconds
    },
    
    init: function() {
      GrawLogger.log('GRAW AI: Initializing simple attribution tracker');
      
      // Track when conversations start
      this.trackConversationStarts();
      
      // Check attribution when checkout happens
      this.trackCheckouts();
      
      // Clean old data periodically
      this.cleanOldData();
    },
    
    /**
     * Track when conversations start/occur
     */
    trackConversationStarts: function() {
      // Listen for conversation state changes
      window.addEventListener('conversationStateChanged', (event) => {
        if (event.detail.isOngoing) {
          this.recordInteraction('conversation_started');
        }
      });
      
      // Listen for widget open (user clicked to open chat)
      let lastWidgetState = false;
      setInterval(() => {
        if (typeof window.ConversationStateManager !== 'undefined') {
          const isOpen = window.ConversationStateManager.isWidgetOpen();
          if (isOpen && !lastWidgetState) {
            // Widget just opened
            this.recordInteraction('widget_opened');
            
            // Fire event for Voiceflow to potentially create Klaviyo event
            // (Only matters if user is identified with email)
            window.dispatchEvent(new CustomEvent('chatbotWidgetOpened', {
              detail: {
                timestamp: new Date().toISOString(),
                userId: this.getUserId()
              }
            }));
          }
          lastWidgetState = isOpen;
        }
      }, 1000); // Check every second for widget state changes
    },
    
    /**
     * Record a chat interaction
     */
    recordInteraction: function(interactionType = 'unknown') {
      const data = this.getStoredData();
      const now = new Date().toISOString();
      
      // Don't record if we just recorded one (within debounce time)
      if (data.lastInteraction) {
        const timeSince = Date.now() - new Date(data.lastInteraction).getTime();
        if (timeSince < this.config.debounceTime) return;
      }
      
      // Update interaction data
      data.lastInteraction = now;
      if (!data.firstInteraction) {
        data.firstInteraction = now;
      }
      data.interactionCount = (data.interactionCount || 0) + 1;
      data.lastInteractionType = interactionType;
      
      // Store customer info if available (for when they're logged in)
      if (window.customerData?.customer?.email) {
        data.email = window.customerData.customer.email;
        data.customerId = window.customerData.customer.id;
        // Note: If email exists, Voiceflow/Klaviyo tracking takes over
        // This is just backup for same-device tracking
      }
      
      // Store user ID for consistency
      data.userId = this.getUserId();
      
      // Save
      this.saveData(data);
      GrawLogger.log('GRAW AI: Recorded chat interaction (local)', {
        type: interactionType,
        count: data.interactionCount,
        hasEmail: !!data.email
      });
    },
    
    /**
     * Track checkout events
     */
    trackCheckouts: function() {
      // Listen for our checkout tracking event from checkout-tracking.js
      // NOTE: checkout-tracking.js already sends the attribution, so we'll just log it
      window.addEventListener('grawCheckoutWithConversation', (event) => {
        GrawLogger.log('GRAW AI: Checkout with conversation event received, already tracked by checkout-tracking.js');
        // Don't double-track - checkout-tracking.js already sends this
        // this.checkAttribution(event.detail);
      });
      
      // DISABLED: Track checkout button clicks for 5-day attribution window
      // This was causing double counting with checkout-tracking.js
      // TODO: Implement proper coordination between the two trackers
      
      /*
      document.addEventListener('click', (e) => {
        const isCheckoutButton = 
          e.target.matches('[name="checkout"]') ||
          e.target.closest('[name="checkout"]') ||
          e.target.matches('.cart__checkout') ||
          e.target.closest('.cart__checkout');
          
        if (isCheckoutButton) {
          GrawLogger.log('GRAW AI: Checkout button clicked - attribution disabled to prevent double counting');
          // this.checkAttribution(); // DISABLED
        }
      }, true);
      */
      
      // Try to restore from sessionStorage if localStorage was cleared
      if (!localStorage.getItem(this.config.storageKey)) {
        const backup = sessionStorage.getItem(this.config.storageKey + '_backup');
        if (backup) {
          try {
            localStorage.setItem(this.config.storageKey, backup);
            GrawLogger.log('GRAW AI: Restored attribution data from backup');
          } catch(e) {
            GrawLogger.warn('GRAW AI: Could not restore from backup', e);
          }
        }
      }
    },
    
    /**
     * Check if checkout should be attributed to chat
     */
    checkAttribution: function(checkoutData = {}) {
      const data = this.getStoredData();
      
      GrawLogger.log('GRAW AI: Checking attribution with data:', {
        hasInteraction: !!data.lastInteraction,
        lastInteraction: data.lastInteraction,
        interactionCount: data.interactionCount,
        checkoutData: checkoutData
      });
      
      if (!data.lastInteraction) {
        GrawLogger.log('GRAW AI: No chat interactions recorded in localStorage');
        return;
      }
      
      // Check if interaction was within attribution window
      const daysSinceInteraction = 
        (Date.now() - new Date(data.lastInteraction).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceInteraction <= this.config.attributionWindowDays) {
        GrawLogger.log('GRAW AI: Checkout attributed to chat!', {
          daysSinceInteraction: daysSinceInteraction.toFixed(1),
          interactionCount: data.interactionCount,
          willSendToBackend: this.config.sendToBackend
        });
        
        // Check if we've already attributed this session to prevent duplicates
        const attributionSentKey = this.config.storageKey + '_sent';
        if (sessionStorage.getItem(attributionSentKey) === data.lastInteraction) {
          GrawLogger.log('GRAW AI: Attribution already sent for this interaction period, skipping duplicate');
          return;
        }
        
        // Send to backend if configured (required for dashboard metrics)
        if (this.config.sendToBackend) {
          // Mark as being sent to prevent duplicates
          sessionStorage.setItem(attributionSentKey, data.lastInteraction);
          
          this.sendAttribution({
            ...checkoutData,
            attributed: true,
            firstInteraction: data.firstInteraction,
            lastInteraction: data.lastInteraction,
            interactionCount: data.interactionCount,
            daysSinceInteraction: daysSinceInteraction,
            email: data.email || checkoutData.customerEmail,
            customerId: data.customerId || checkoutData.customerId
          });
        }
        
        // Fire event for dashboard
        window.dispatchEvent(new CustomEvent('chatAttributedCheckout', {
          detail: {
            daysSinceInteraction: daysSinceInteraction,
            interactionCount: data.interactionCount
          }
        }));
      } else {
        GrawLogger.log('GRAW AI: Checkout NOT attributed (outside window)', {
          daysSinceInteraction: daysSinceInteraction.toFixed(1)
        });
      }
    },
    
    /**
     * Send attribution data to backend
     */
    sendAttribution: function(data) {
      // Try multiple methods to get the shop domain in the correct format
      let shopDomain = window.GRAW_AI_SETTINGS?.shopDomain || 
                      window.Shopify?.shop || 
                      sessionStorage.getItem('graw_shop_domain');
      
      // Fallback: if we only have hostname, try to construct myshopify.com format
      if (!shopDomain) {
        const hostname = window.location.hostname;
        // If it's already a .myshopify.com domain, use it
        if (hostname.includes('.myshopify.com')) {
          shopDomain = hostname;
        } else {
          // Log the issue and use hostname as fallback
          GrawLogger.warn('GRAW AI: Could not determine shop domain in myshopify.com format, using hostname:', hostname);
          shopDomain = hostname;
        }
      }
      
      const url = `${this.config.endpoint}?action=trackChatAttribution&shop=${shopDomain}`;
      
      // Add attribution type to distinguish from Klaviyo attributions
      data.attributionType = data.email ? 'local_identified' : 'local_anonymous';
      
      GrawLogger.log('GRAW AI: Sending attribution to backend:', {
        url: url,
        data: data
      });
      
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        GrawLogger.log('GRAW AI: Attribution response status:', response.status);
        return response.json();
      })
      .then(result => {
        GrawLogger.log('GRAW AI: Attribution response data:', result);
        if (result.success) {
          GrawLogger.log('GRAW AI: Attribution data sent successfully, ID:', result.id);
          // Clear the interaction data after successful attribution
          this.clearInteractionData();
        } else {
          GrawLogger.error('GRAW AI: Attribution failed:', result.message);
        }
      })
      .catch(error => {
        GrawLogger.error('GRAW AI: Failed to send attribution:', error);
      });
    },
    
    /**
     * Get stored data
     */
    getStoredData: function() {
      try {
        const stored = localStorage.getItem(this.config.storageKey);
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    },
    
    /**
     * Save data
     */
    saveData: function(data) {
      try {
        localStorage.setItem(this.config.storageKey, JSON.stringify(data));
      } catch (error) {
        GrawLogger.error('GRAW AI: Failed to save attribution data:', error);
      }
    },
    
    /**
     * Get user ID helper
     */
    getUserId: function() {
      if (typeof UserIdentifier !== 'undefined' && UserIdentifier.getUserId) {
        return UserIdentifier.getUserId();
      }
      return sessionStorage.getItem('graw_user_id') || 'anonymous';
    },
    
    /**
     * Clear interaction data after attribution
     */
    clearInteractionData: function() {
      localStorage.removeItem(this.config.storageKey);
      GrawLogger.log('GRAW AI: Cleared attribution data after successful attribution');
    },
    
    /**
     * Clean data older than attribution window
     */
    cleanOldData: function() {
      const data = this.getStoredData();
      
      if (data.lastInteraction) {
        const daysSince = 
          (Date.now() - new Date(data.lastInteraction).getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSince > this.config.attributionWindowDays) {
          // Data is too old, clear it
          this.clearInteractionData();
        }
      }
      
      // Run cleanup every hour
      setTimeout(() => this.cleanOldData(), 60 * 60 * 1000);
    }
  };
  
  // Export for manual initialization
  window.SimpleAttributionTracker = SimpleAttributionTracker;
  
  // Auto-initialization - tracks chatbot interactions in localStorage
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      GrawLogger.log('GRAW AI: DOM loaded, initializing SimpleAttributionTracker');
      SimpleAttributionTracker.init();
    });
  } else {
    // DOM already loaded
    GrawLogger.log('GRAW AI: Initializing SimpleAttributionTracker immediately');
    SimpleAttributionTracker.init();
  }
})();
