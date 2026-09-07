// checkout-tracking.js
(function() {
  'use strict';
  
  const CheckoutTracker = {
    // Configuration
    config: {
      storageKey: 'graw_checkout_tracking',
      eventEndpoint: '/apps/voiceflow',
      checkoutSelectors: [
        'button[name="checkout"]',
        'input[name="checkout"]',
        'button[type="submit"][name="checkout"]',
        '#checkout',
        '.checkout-button',
        '.cart__checkout',
        '.cart__checkout-button',
        '[data-checkout-button]',
        'form[action*="/checkout"] button[type="submit"]',
        'a[href*="/checkout"]'
      ],
      debounceDelay: 500
    },
    
    // State management
    state: {
      conversationOngoing: false,
      lastCheckoutClick: null,
      checkoutInitiated: false,
      sessionId: null
    },
    
    /**
     * Initialize the checkout tracker
     */
    init: function() {
      GrawLogger.log('GRAW AI: Initializing checkout tracker');
      
      // Generate or retrieve session ID
      this.initializeSession();
      
      // Check conversation state
      this.syncConversationState();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Listen for conversation state changes
      this.listenForConversationUpdates();
      
      // Monitor URL changes for checkout detection
      this.monitorCheckoutNavigation();
      
      GrawLogger.log('GRAW AI: Checkout tracker initialized');
    },
    
    /**
     * Initialize or retrieve session ID
     */
    initializeSession: function() {
      let sessionId = sessionStorage.getItem('graw_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('graw_session_id', sessionId);
      }
      this.state.sessionId = sessionId;
    },
    
    /**
     * Sync conversation state from conversation-state-manager
     */
    syncConversationState: function() {
      if (typeof window.ConversationStateManager !== 'undefined') {
        // Primary: read Voiceflow session directly (most accurate, no network call)
        if (window.ConversationStateManager.hasOngoingConversation) {
          this.state.conversationOngoing = 
            window.ConversationStateManager.hasOngoingConversation() ||
            window.ConversationStateManager.isWidgetOpen();
        } else {
          // Fallback: use the property kept up to date by setInterval polling
          this.state.conversationOngoing = 
            window.ConversationStateManager.isConversationOngoing || 
            window.ConversationStateManager.isWidgetOpen();
        }
      } else {
        // Last resort: sessionStorage flag
        this.state.conversationOngoing = 
          sessionStorage.getItem('graw_conversation_ongoing') === 'true';
      }
      
      GrawLogger.log('GRAW AI: Conversation state synced:', this.state.conversationOngoing);
    },
    
    /**
     * Set up event listeners for checkout buttons
     */
    setupEventListeners: function() {
      // Use event delegation for better performance
      document.addEventListener('click', this.handleClick.bind(this), true);
      
      // Also listen for form submissions
      document.addEventListener('submit', this.handleFormSubmit.bind(this), true);
    },
    
    /**
     * Handle click events
     */
    handleClick: function(event) {
      const target = event.target;
      
      // Check if clicked element matches any checkout selector
      const isCheckoutButton = this.config.checkoutSelectors.some(selector => {
        try {
          return target.matches(selector) || target.closest(selector);
        } catch(e) {
          return false;
        }
      });
      
      if (isCheckoutButton) {
        this.handleCheckoutClick(event);
      }
    },
    
    /**
     * Handle form submit events
     */
    handleFormSubmit: function(event) {
      const form = event.target;
      
      // Check if form action contains checkout
      if (form.action && form.action.includes('/checkout')) {
        this.handleCheckoutClick(event);
      }
    },
    
    /**
     * Handle checkout button click
     */
    handleCheckoutClick: function(event) {
      // Debounce to avoid duplicate tracking
      const now = Date.now();
      if (this.state.lastCheckoutClick && (now - this.state.lastCheckoutClick) < this.config.debounceDelay) {
        return;
      }
      
      this.state.lastCheckoutClick = now;
      
      // Sync latest conversation state
      this.syncConversationState();
      
      if (this.state.conversationOngoing) {
        GrawLogger.log('GRAW AI: Checkout clicked with ongoing conversation');
        this.trackCheckoutWithConversation();
      } else {
        GrawLogger.log('GRAW AI: Checkout clicked without conversation');
      }
    },
    
    /**
     * Track checkout initiated with conversation
     */
    trackCheckoutWithConversation: function() {
      const trackingData = {
        event: 'checkout_with_conversation',
        sessionId: this.state.sessionId,
        userId: this.getUserId(),
        timestamp: new Date().toISOString(),
        conversationOngoing: true,
        cartValue: this.getCartValue(),
        itemCount: this.getCartItemCount(),
        shopDomain: window.GRAW_AI_SETTINGS?.shopDomain || window.Shopify?.shop,
        customerEmail: this.getCustomerEmail(),
        customerId: this.getCustomerId()
      };
      
      // Store in sessionStorage for persistence
      sessionStorage.setItem('graw_checkout_initiated_with_chat', JSON.stringify(trackingData));
      
      // Send to backend
      this.sendTrackingData(trackingData);
      
      // Fire custom event for other scripts to listen to
      window.dispatchEvent(new CustomEvent('grawCheckoutWithConversation', { 
        detail: trackingData 
      }));
    },
    
    /**
     * Monitor URL changes to detect checkout navigation
     */
    monitorCheckoutNavigation: function() {
      let lastUrl = window.location.href;
      
      // Check for URL changes using MutationObserver
      const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          this.checkForCheckoutPage();
        }
      });
      
      observer.observe(document, { subtree: true, childList: true });
      
      // Also use popstate for browser navigation
      window.addEventListener('popstate', () => {
        this.checkForCheckoutPage();
      });
      
      // Initial check
      this.checkForCheckoutPage();
    },
    
    /**
     * Check if currently on checkout page
     */
    checkForCheckoutPage: function() {
      // Note: Shopify checkout is usually on a different domain (checkout.shopify.com)
      // But we can detect the redirect moment
      const isCheckoutUrl = window.location.pathname.includes('/checkout') ||
                           window.location.pathname.includes('/checkouts') ||
                           window.location.hostname.includes('checkout');
      
      if (isCheckoutUrl && !this.state.checkoutInitiated) {
        this.state.checkoutInitiated = true;
        this.syncConversationState();
        
        if (this.state.conversationOngoing) {
          GrawLogger.log('GRAW AI: Navigated to checkout with ongoing conversation');
          this.trackCheckoutWithConversation();
        }
      } else if (!isCheckoutUrl) {
        this.state.checkoutInitiated = false;
      }
    },
    
    /**
     * Listen for conversation state updates
     */
    listenForConversationUpdates: function() {
      // Listen for custom events from conversation-state-manager
      window.addEventListener('conversationStateChanged', (event) => {
        this.state.conversationOngoing = event.detail?.isOngoing || false;
        GrawLogger.log('GRAW AI: Conversation state updated:', this.state.conversationOngoing);
      });
      
      // Also listen for storage events for cross-tab communication
      window.addEventListener('storage', (event) => {
        if (event.key === 'graw_conversation_ongoing') {
          this.state.conversationOngoing = event.newValue === 'true';
        }
      });
    },
    
    /**
     * Get user ID from various sources
     */
    getUserId: function() {
      // Try to get from UserIdentifier
      if (typeof UserIdentifier !== 'undefined' && UserIdentifier.getUserId) {
        return UserIdentifier.getUserId();
      }
      
      // Fallback to sessionStorage
      return sessionStorage.getItem('graw_user_id') || 'unknown';
    },
    
    /**
     * Get customer email if available
     */
    getCustomerEmail: function() {
      // Try various sources
      return window.customerData?.customer?.email || 
             window.Shopify?.customer?.email ||
             sessionStorage.getItem('graw_customer_email') ||
             null;
    },
    
    /**
     * Get customer ID if available
     */
    getCustomerId: function() {
      return window.customerData?.customer?.id || 
             window.Shopify?.customer?.id ||
             sessionStorage.getItem('graw_customer_id') ||
             null;
    },
    
    /**
     * Get cart value
     */
    getCartValue: function() {
      if (window.shopifyCart) {
        return window.shopifyCart.total_price / 100; // Convert from cents
      }
      
      // Try to get from Shopify Cart API
      try {
        fetch('/cart.js')
          .then(res => res.json())
          .then(cart => cart.total_price / 100)
          .catch(() => 0);
      } catch {
        return 0;
      }
    },
    
    /**
     * Get cart item count
     */
    getCartItemCount: function() {
      return window.shopifyCart?.item_count || 0;
    },
    
    /**
     * Send tracking data to backend
     */
    sendTrackingData: function(data) {
      // Try multiple methods to get the shop domain in the correct format
      let shopDomain = data.shopDomain || 
                      window.GRAW_AI_SETTINGS?.shopDomain || 
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
      
      const endpoint = `${this.config.eventEndpoint}?action=trackCheckout&shop=${shopDomain}`;
      
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          GrawLogger.warn('GRAW AI: Failed to send checkout tracking data');
        }
      })
      .catch(error => {
        GrawLogger.error('GRAW AI: Error sending checkout tracking data:', error);
      });
    }
  };
  
  // Export for other scripts and manual initialization
  window.GrawCheckoutTracker = CheckoutTracker;
})();
