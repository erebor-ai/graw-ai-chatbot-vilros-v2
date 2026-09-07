// checkout-tracker.js
/**
 * Simplified Checkout Tracker using UnifiedAttributionTracker
 * 
 * This script handles checkout button click attribution using the
 * unified attribution system for consistent tracking.
 */
(function() {
  'use strict';
  
  const CheckoutTracker = {
    // Configuration
    config: {
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
      lastCheckoutClick: null
    },
    
    /**
     * Initialize the checkout tracker
     */
    init: function() {
      GrawLogger.log('GRAW AI: Checkout Tracker initialized (using UnifiedAttributionTracker)');
      
      // Wait for UnifiedAttributionTracker to be available
      this.waitForUnifiedTracker(() => {
        this.setupEventListeners();
        this.monitorCheckoutNavigation();
      });
    },
    
    /**
     * Wait for UnifiedAttributionTracker to be available
     */
    waitForUnifiedTracker: function(callback) {
      if (typeof window.UnifiedAttributionTracker !== 'undefined') {
        callback();
      } else {
        setTimeout(() => this.waitForUnifiedTracker(callback), 100);
      }
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
      
      GrawLogger.log('GRAW AI: Checkout button clicked');
      
      // Use UnifiedAttributionTracker to track this event
      window.UnifiedAttributionTracker.trackEvent('checkout_started', {
        cartValue: this.getCartValue(),
        itemCount: this.getCartItemCount(),
        customerEmail: this.getCustomerEmail(),
        customerId: this.getCustomerId()
      });
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
      const isCheckoutUrl = window.location.pathname.includes('/checkout') ||
                           window.location.pathname.includes('/checkouts') ||
                           window.location.hostname.includes('checkout');
      
      if (isCheckoutUrl) {
        GrawLogger.log('GRAW AI: Navigated to checkout page');
        
        // Use UnifiedAttributionTracker to track checkout navigation
        window.UnifiedAttributionTracker.trackEvent('checkout_started', {
          source: 'navigation',
          cartValue: this.getCartValue(),
          itemCount: this.getCartItemCount(),
          customerEmail: this.getCustomerEmail(),
          customerId: this.getCustomerId()
        });
      }
    },
    
    /**
     * Get customer email if available
     */
    getCustomerEmail: function() {
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
      
      return 0;
    },
    
    /**
     * Get cart item count
     */
    getCartItemCount: function() {
      return window.shopifyCart?.item_count || 0;
    }
  };
  
  // Export for other scripts and manual initialization
  window.GrawCheckoutTracker = CheckoutTracker;
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CheckoutTracker.init());
  } else {
    CheckoutTracker.init();
  }
})();