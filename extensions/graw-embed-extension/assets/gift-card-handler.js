const GiftCardAllocator = {
    // Base configuration
    probability: 5, // Base chance in percentage
    _freeShippingThreshold: 75 * 100, // $75 free shipping threshold (to set)
  
    // Configuration for customer tracking
    trackingConfig: {
      enableCustomTracking: false, // toggle for custom tracking system - default to disabled for privacy compliance
      cookieExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      cookieName: 'gca_visitor_id',
      localStorageKey: 'gca_visitor_data',
      sessionEligibilityKey: 'gca_eligibility_status', // New key for session storage    
    },
  
    // Configuration for weight factors
    weightConfig: {
      persistence: {
        initialCheck: 1 * 60 * 1000, // 1 minutes for initial check
        checkInterval: 3 * 60 * 1000, // Every 3 minutes thereafter CHANGED FOR TETSING
      },
      timeOnSite: {
        increment: 4, // 4% increase every interval
        max: 12, // Capped at 12% increase
        interval: 5 * 60 * 1000, // 5 minutes per interval
      },
      productsViewed: {
        increment: 1,
        max: 5, // Capped at 5% increase
      },
      searchesPerformed: {
        increment: 0.5,
        max: 5,
      },
      cartAdditions: {
        increment: 3,
        max: 9,
      },
      checkoutVisits: {
        increment: 5,
        max: 15,
      },
      customerStatus: {
        singleOrderBonus: 10,       // One order ever
        inactiveRepeatBonus: 20,    // Multiple orders but none in 3 months
        subscribedNoOrdersBonus: 15, // Identified but no orders, subscribed
        unsubscribedNoOrdersBonus: 10, // Identified but no orders, not subscribed
        newCustomerBonus: 10,       // Completely unidentified
        inactivityThreshold: 90 * 24 * 60 * 60 * 1000, // 3 months in milliseconds
      },
      cartValue: {
        threshold: 100,
        increment: 5,
      },
      nearFreeShipping: {
        threshold: 10,
        increment: 4,
      },
      emailSubscriber: {
        noOrderBonus: 20,
      }
    },
  
    config: {
      minTimeBetweenAllocations: 7 * 24 * 60 * 60 * 1000, // 1 week between code allocations per customer
    },
  
    state: {
      timeOnSite: 0,
      productsViewed: 0,
      searchesPerformed: 0,
      totalOrderValue: window.customerData?.totalSpent || 0,
      totalPastOrders: window.customerData?.totalOrders || 0,
      isReturningVisitor: false,
      lastAllocationTime: null,
      allocationsThisSession: 0,
      sessionStart: Date.now(),
      returnVisitorApplied: false,
      visitorId: null,
      klaviyoIdentified: false,
      cartItemCount: 0,
      checkoutVisits: 0,
      isEligible: true,
      lastOrderDate: null,
    },
  
    isProductPage: function () {
      try {
        return (
          window.meta?.page?.pageType === "product" ||
          window.location.pathname.includes("/products/")
        );
      } catch (error) {
        GrawLogger.error("Error checking if product page:", error);
        return false;
      }
    },  
  
    initializeState: function() {
      this.state = {
        timeOnSite: 0,
        productsViewed: 0,
        searchesPerformed: 0,
        totalOrderValue: window.customerData?.totalSpent || 0,
        totalPastOrders: window.customerData?.totalOrders || 0,
        isReturningVisitor: false,
        lastAllocationTime: null,
        allocationsThisSession: 0,
        sessionStart: Date.now(),
        returnVisitorApplied: false,
        visitorId: null,
        klaviyoIdentified: false,
        cartItemCount: window.shopifyCart?.item_count || 0,
        checkoutVisits: 0,
        isEligible: true,
        lastOrderDate: null,
      };
    },
  
    checkShopifyLogin: async function() {
      this.state.isReturningVisitor = window.customerData?.isReturningVisitor || false;
      GrawLogger.log("Shopify login check:", this.state.isReturningVisitor);
      return this.state.isReturningVisitor;
    },
  
    // Check if customer is eligible for allocation
    checkCustomerEligibility: async function() {
      GrawLogger.log("Starting eligibility check...");
      
    // First check Shopify login and orders
    if (window.customerData?.isReturningVisitor) {
      GrawLogger.log("Customer identified through Shopify");
      
      if (window.customerData?.customer?.orders && window.customerData.customer.orders.length > 0) {
        const sortedOrders = [...window.customerData.customer.orders].sort((a, b) => {
          const getDate = (order) => {
            if (Array.isArray(order.created_at)) {
              const [seconds, minutes, hours, day, month, year] = order.created_at;
              return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
            }
            return new Date(order.created_at);
          };
          return getDate(b) - getDate(a);
        });
        
        GrawLogger.log("Sorted orders:", sortedOrders);
        const lastOrder = sortedOrders[0];
        const lastOrderDate = Array.isArray(lastOrder.created_at) 
          ? getDate(lastOrder)
          : new Date(lastOrder.created_at);
        
        const now = new Date();
        const timeSinceLastOrder = now - lastOrderDate;
        GrawLogger.log("Time since last order (ms):", timeSinceLastOrder);
        
        this.state.lastOrderDate = lastOrderDate;
        
        const totalOrders = window.customerData.customer.orders.length;
        GrawLogger.log(totalOrders)
        
        // Updated eligibility logic
        if (totalOrders === 1) {
          // Single order customers are always eligible
          GrawLogger.log("Customer has single order - eligible with single order bonus");
          this.state.isEligible = true;
          return true;
        } else if (timeSinceLastOrder < this.weightConfig.customerStatus.inactivityThreshold) {
          // Active repeat customers (>1 order AND recent order) are not eligible
          GrawLogger.log("Active repeat customer - not eligible");
          this.state.isEligible = false;
          return false;
        } else {
          // Inactive repeat customers are eligible
          GrawLogger.log("Customer inactive for 3+ months - eligible with inactive repeat bonus");
          this.state.isEligible = true;
          return true;
        }
      } else {
        // No orders - should be handled by calculateProbability
        GrawLogger.log("Customer has no orders");
        this.state.isEligible = true;
        return true;
        }
      }
      
      // Then check Klaviyo eligibility (which is set by the OrderHistoryExtension)
      const klaviyoEligibilityStr = sessionStorage.getItem('isKlaviyoEligible');
      if (klaviyoEligibilityStr !== null) {
        const isKlaviyoEligible = JSON.parse(klaviyoEligibilityStr);
        GrawLogger.log("Klaviyo eligibility status:", isKlaviyoEligible);
        this.state.isEligible = isKlaviyoEligible;
        return isKlaviyoEligible;
      }
      
      // Check if we already have an eligibility determination for this session
      const savedEligibility = sessionStorage.getItem(this.trackingConfig.sessionEligibilityKey);
      if (savedEligibility !== null) {
        const eligibility = JSON.parse(savedEligibility);
        GrawLogger.log("Retrieved eligibility from session:", eligibility);
        this.state.isEligible = eligibility;
        return eligibility;
      }
      
      // Only perform custom tracking check if enabled
      if (this.trackingConfig.enableCustomTracking) {
        const customTrackingResult = await this.performCustomTrackingCheck();
        this.saveEligibilityToSession(customTrackingResult);
        return customTrackingResult;
      }
      
      // If none of the above conditions apply, treat as new customer
      GrawLogger.log("New customer - eligible with bonus");
      this.state.isEligible = true;
      this.saveEligibilityToSession(true);
      sessionStorage.setItem('new_customer', 'true');
      return true;
    },
    
    // Updated setupCheckoutTracking with debounce
    setupCheckoutTracking: function() {
      // Add debounce utility
      const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      };
      
      // Debounced version of handleCheckoutVisit
      const debouncedHandleCheckout = debounce(() => {
        this.handleCheckoutVisit();
      }, 300); // 300ms debounce time
    
      // Use event delegation on document to catch all checkout button clicks
      document.addEventListener('click', (event) => {
        const target = event.target;
        
        // Check if it's a checkout button
        const isCheckoutButton = (
          (target.id === 'checkout') ||
          (target.getAttribute('name') === 'checkout') ||
          (target.matches('input[name="checkout"]')) ||
          (target.textContent?.trim().toLowerCase() === 'check out') ||
          (target.classList.contains('cart__checkout-button') ||
           target.classList.contains('cart-submit'))
        );
    
        if (isCheckoutButton) {
          debouncedHandleCheckout();
        }
      });
    
      // Listen for form submissions
      document.addEventListener('submit', (event) => {
        const form = event.target;
        if (form.getAttribute('action')?.includes('/checkout') || 
            form.id === 'cart' ||
            form.classList.contains('cart-form')) {
          debouncedHandleCheckout();
        }
      });
    },
    
    // Update handleCheckoutVisit to include better logging
    handleCheckoutVisit: function() {
      const maxVisits = Math.floor(this.weightConfig.checkoutVisits.max / 
                                  this.weightConfig.checkoutVisits.increment);
                                  
      this.state.checkoutVisits = Math.min(
        (parseInt(sessionStorage.getItem("checkoutVisits") || "0", 10) + 1),
        maxVisits
      );
    
      try {
        sessionStorage.setItem('checkoutVisits', this.state.checkoutVisits.toString());
        GrawLogger.log("Checkout visit recorded. Total visits:", this.state.checkoutVisits);
      } catch (error) {
        GrawLogger.warn("Failed to save checkout visits:", error);
      }
    },
  
    setupCartTracking: function() {
      // Track cart changes
      let lastItemCount = this.state.cartItemCount;
      const observer = new MutationObserver(() => {
        const currentItemCount = window.shopifyCart?.item_count || 0;
        if (currentItemCount > lastItemCount) {
          this.handleCartAddition(currentItemCount - lastItemCount);
        }
        lastItemCount = currentItemCount;
      });
      observer.observe(document, { subtree: true, childList: true });
    },
  
    handleCartAddition: function(itemsAdded) {
      const maxItems = Math.floor(this.weightConfig.cartAdditions.max / 
                                 this.weightConfig.cartAdditions.increment);
      this.state.cartItemCount = Math.min(this.state.cartItemCount + itemsAdded, maxItems);
      sessionStorage.setItem('cartItemCount', this.state.cartItemCount.toString());
    },
  
    setupEventListeners: function() {
      // Batch our DOM operations
      if (this.isProductPage()) {
        this.handleProductView();
      }
  
      if (window.searchData?.performed) {
        this.handleSearch();
      }
  
      this.setupSearchTracking();
      this.timeInterval = this.trackTimeOnSite();
    },
  
    checkKlaviyoIdentification: async function () {
      try {
        GrawLogger.log("Checking Klaviyo identification...");
    
        // Ensure Klaviyo is available on the page
        if (typeof klaviyo !== 'undefined' && typeof klaviyo.isIdentified === 'function') {
          // Create a promise that rejects after 5 seconds
          const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Klaviyo identification timed out')), 5000);
          });
  
          // Race between Klaviyo identification and timeout
          const isIdentified = await Promise.race([
            klaviyo.isIdentified(),
            timeout
          ]).catch(error => {
            GrawLogger.warn("Klaviyo identification failed:", error.message);
            return false;
          });
    
          GrawLogger.log("Klaviyo isIdentified response:", isIdentified);
    
          if (isIdentified) {
            this.state.klaviyoIdentified = true;
            this.state.isReturningVisitor = true;
            GrawLogger.log("Klaviyo identification successful. User is returning.");
            return true;
          } else {
            GrawLogger.log("Klaviyo identification failed. User is not identified.");
            return false;
          }
        } else {
          GrawLogger.warn("Klaviyo API is not available or not properly initialized.");
          return false;
        }
      } catch (error) {
        GrawLogger.error("Error during Klaviyo identification check:", error);
        return false;
      }
    },
  
    checkCustomTracking: async function() {
      if (!this.trackingConfig.enableCustomTracking) {
        GrawLogger.log("Custom tracking disabled - skipping");
        return;
      }
  
      GrawLogger.log("Starting custom tracking...");
      let visitorId = this.getCookie(this.trackingConfig.cookieName);
      GrawLogger.log("Existing visitor ID from cookie:", visitorId);
    
      if (!visitorId) {
        GrawLogger.log("No visitor ID found. Generating a new one...");
        visitorId = this.generateVisitorId();
        this.setCookie(this.trackingConfig.cookieName, visitorId);
        GrawLogger.log("New visitor ID set in cookie:", visitorId);
      }
    
      this.state.visitorId = visitorId;
    
      const visitorData = this.getVisitorData();
      GrawLogger.log("Visitor data from localStorage:", visitorData);
    
      if (visitorData) {
        const lastVisit = new Date(visitorData.lastVisit);
        const now = new Date();
        const daysSinceLastVisit = (now - lastVisit) / (1000 * 60 * 60 * 24);
        GrawLogger.log("Days since last visit:", daysSinceLastVisit);
    
        if (daysSinceLastVisit <= 7) {
          GrawLogger.log("Visitor is considered a returning visitor.");
          this.state.isReturningVisitor = true;
        } else {
          GrawLogger.log("Visitor is not within the 7-day window.");
        }
      } else {
        GrawLogger.log("No previous visitor data found.");
      }
        GrawLogger.log("Custom tracking completed.");
    },
  
    generateVisitorId: function() {
      return 'gca_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
  
    getCookie: function(name) {
      if (!this.trackingConfig.enableCustomTracking) return null;
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    },
  
    setCookie: function(name, value) {
      if (!this.trackingConfig.enableCustomTracking) return;
      const expires = new Date(Date.now() + this.trackingConfig.cookieExpiry).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    },
  
    getVisitorData: function() {
      if (!this.trackingConfig.enableCustomTracking) return null;
      try {
        const data = localStorage.getItem(this.trackingConfig.localStorageKey);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        GrawLogger.warn("Failed to get visitor data:", error);
        return null;
      }
    },
  
       // New method to save eligibility to session storage
    saveEligibilityToSession: function(eligibility) {
      sessionStorage.setItem(
        this.trackingConfig.sessionEligibilityKey, 
        JSON.stringify(eligibility)
      );
      GrawLogger.log("Saved eligibility to session:", eligibility);
    },
  
    // New method to handle custom tracking check
    performCustomTrackingCheck: async function() {
      GrawLogger.log("Performing custom tracking check...");
      const visitorData = this.getVisitorData();
      
      if (!visitorData) {
        // First time visitor - record the visit but return eligible
        this.recordInitialVisit();
        return true;
      }
  
      // Check if last visit was within 7 days
      const lastVisit = new Date(visitorData.lastVisit);
      const now = new Date();
      const daysSinceLastVisit = (now - lastVisit) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastVisit <= 7) {
        GrawLogger.log("Returning visitor within 7 days - not eligible");
        return false;
      }
  
      // Visitor returning after 7 days - treat as new
      this.recordInitialVisit();
      return true;
    },
  
    // New method to record initial visit
    recordInitialVisit: function() {
      try {
        const visitorId = this.generateVisitorId();
        const data = {
          visitorId: visitorId,
          lastVisit: new Date().toISOString(),
          visits: 1
        };
        localStorage.setItem(this.trackingConfig.localStorageKey, JSON.stringify(data));
        this.setCookie(this.trackingConfig.cookieName, visitorId);
        GrawLogger.log("Recorded initial visit");
      } catch (error) {
        GrawLogger.warn("Failed to record initial visit:", error);
      }
    },
  
    // Update loadSavedState to properly handle session persistence
    loadSavedState: function() {
      try {
        const sessionId = sessionStorage.getItem("giftCardSessionId");
        if (!sessionId) {
          GrawLogger.warn("No session ID found when loading saved state");
          return;
        }
    
        // Load products viewed from sessionStorage
        const savedProducts = sessionStorage.getItem("productsViewed");
        if (savedProducts) {
          this.state.productsViewed = parseInt(savedProducts, 10);
        }
    
        // Load time on site from sessionStorage
        const savedTime = sessionStorage.getItem("timeOnSite");
        if (savedTime) {
          this.state.timeOnSite = parseInt(savedTime, 10);
        }
    
        // Site start time should also be in sessionStorage
        const savedStartTime = sessionStorage.getItem("siteStartTime");
        if (savedStartTime) {
          this.startTime = parseInt(savedStartTime, 10);
        }
    
        // Load search count from sessionStorage (already correct)
        const savedSearchCount = sessionStorage.getItem("searchCount");
        if (savedSearchCount) {
          this.state.searchesPerformed = parseInt(savedSearchCount, 10);
        }
    
        // Load checkout visits from sessionStorage (already correct)
        const savedCheckoutVisits = sessionStorage.getItem("checkoutVisits");
        if (savedCheckoutVisits) {
          this.state.checkoutVisits = parseInt(savedCheckoutVisits, 10);
        }
    
        GrawLogger.log("Loaded saved state:", {
          productsViewed: this.state.productsViewed,
          timeOnSite: this.state.timeOnSite,
          searchesPerformed: this.state.searchesPerformed,
          checkoutVisits: this.state.checkoutVisits
        });
      } catch (error) {
        GrawLogger.warn("Failed to load saved state:", error);
      }
    },
  
    // Update handleProductView to use sessionStorage
    handleProductView: function() {
      const savedProducts = parseInt(sessionStorage.getItem("productsViewed") || "0", 10);
      this.state.productsViewed = Math.min(
        savedProducts + 1,
        Math.floor(this.weightConfig.productsViewed.max / this.weightConfig.productsViewed.increment)
      );
      sessionStorage.setItem("productsViewed", this.state.productsViewed.toString());
    },
  
    destroy: function () {
      clearInterval(this.timeInterval);
      clearInterval(this.evaluationInterval);
      document.removeEventListener("searchQueryPerformed", this.searchHandler);
    },
  
    // Update setupSearchTracking to improve search detection
    setupSearchTracking: function() {
      // Track URL changes for search
      let lastUrl = window.location.href;
    
      // Create a new MutationObserver to watch for URL changes
      const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          
          // Check if new URL is a search URL and has a query parameter
          if (window.location.pathname.includes("/search") && 
              (window.location.search.includes('q=') || window.location.search.includes('type=') || 
               window.location.search.includes('query='))) {
            this.handleSearch();
          }
        }
      });
    
      // Start observing
      observer.observe(document, { subtree: true, childList: true });
    
      // Also listen for search form submissions
      document.addEventListener('submit', (event) => {
        const form = event.target;
        if (form.getAttribute('action')?.includes('/search') || 
            form.getAttribute('action') === '/search' ||
            form.classList.contains('search-form') ||
            form.querySelector('input[type="search"]')) {
          this.handleSearch();
        }
      });
    },
    
    // Update handleSearch to include better logging
    handleSearch: function() {
      const maxSearches = Math.floor(this.weightConfig.searchesPerformed.max / 
                                    this.weightConfig.searchesPerformed.increment);
                                    
      this.state.searchesPerformed = Math.min(
        (parseInt(sessionStorage.getItem("searchCount") || "0", 10) + 1),
        maxSearches
      );
    
      // Save search count to session storage
      try {
        sessionStorage.setItem("searchCount", this.state.searchesPerformed.toString());
        GrawLogger.log("Search recorded. Total searches:", this.state.searchesPerformed);
      } catch (error) {
        GrawLogger.warn("Failed to save search count:", error);
      }
    },
  
    // Add session ID management
    getSessionId: function () {
      let sessionId = localStorage.getItem("giftCardSessionId");
      if (!sessionId) {
        sessionId = Date.now().toString();
        localStorage.setItem("giftCardSessionId", sessionId);
      }
      return sessionId;
    },
  
    isProductPage: function () {
      return (
        window.meta?.page?.pageType === "product" ||
        window.location.pathname.includes("/products/")
      );
    },
    
    // Update trackTimeOnSite to use sessionStorage
    trackTimeOnSite: function() {
      const sessionId = sessionStorage.getItem("giftCardSessionId");
      if (!sessionId) {
        GrawLogger.warn("No session ID found when tracking time");
        return;
      }
    
      // Initialize time from sessionStorage if exists
      this.state.timeOnSite = parseInt(sessionStorage.getItem("timeOnSite") || "0", 10);
    
      return setInterval(() => {
        const elapsed = Date.now() - this.startTime;
        const maxTrackingTime = (this.weightConfig.timeOnSite.max / 
          this.weightConfig.timeOnSite.increment) * 
          this.weightConfig.timeOnSite.interval;
        
        this.state.timeOnSite = Math.min(elapsed, maxTrackingTime);
        sessionStorage.setItem("timeOnSite", this.state.timeOnSite.toString());
      }, this.weightConfig.timeOnSite.interval);
    },
    
    canAllocateGiftCard: function () {
      const lastAllocationTime = parseInt(localStorage.getItem('giftCardLastAllocationTime') || '0', 10);
      const now = Date.now();
    
      // Check time between allocations
      if (lastAllocationTime) {
        const timeSinceLastAllocation = now - lastAllocationTime;
        const timeRemaining = 
          this.config.minTimeBetweenAllocations - timeSinceLastAllocation;
    
        if (timeRemaining > 0) {
          GrawLogger.log(
            `Waiting period active. ${Math.round(
              timeRemaining / 3600000
            )} hours remaining`
          );
          return false;
        }
      }
    
      return true;
    },
  
    calculateProbability: function() {
      if (!this.state.isEligible) {
        GrawLogger.log("Customer not eligible for gift card");
        return 0;
      }
    
      let probability = this.probability;
      const weights = [];
    
      // Determine customer type and apply appropriate bonus
      if (window.customerData?.isReturningVisitor) {
        // Shopify-identified customers
        const totalOrders = window.customerData?.customer?.orders.length || 0;
        const lastOrderDate = this.state.lastOrderDate;
        const isSubscribed = window.customerData?.customer?.acceptsMarketing || false;
    
        if (totalOrders === 0) {
          // No orders customer
          if (isSubscribed) {
            probability += this.weightConfig.customerStatus.subscribedNoOrdersBonus;
            weights.push({
              factor: "Subscribed no orders bonus",
              value: "N/A",
              percentage_applied: this.weightConfig.customerStatus.subscribedNoOrdersBonus
            });
          } else {
            probability += this.weightConfig.customerStatus.unsubscribedNoOrdersBonus;
            weights.push({
              factor: "Unsubscribed no orders bonus",
              value: "N/A",
              percentage_applied: this.weightConfig.customerStatus.unsubscribedNoOrdersBonus
            });
          }
        } else if (totalOrders === 1) {
          probability += this.weightConfig.customerStatus.singleOrderBonus;
          weights.push({
            factor: "Single order customer bonus",
            value: "N/A",
            percentage_applied: this.weightConfig.customerStatus.singleOrderBonus
          });
        } else if (lastOrderDate && 
                   (Date.now() - lastOrderDate) >= this.weightConfig.customerStatus.inactivityThreshold) {
          probability += this.weightConfig.customerStatus.inactiveRepeatBonus;
          weights.push({
            factor: "Inactive repeat customer bonus",
            value: "N/A",
            percentage_applied: this.weightConfig.customerStatus.inactiveRepeatBonus
          });
        }
      } else {
        // Check Klaviyo status from sessionStorage
        const klaviyoCustomerType = sessionStorage.getItem('klaviyoCustomerType');
        GrawLogger.log(klaviyoCustomerType)
        if (klaviyoCustomerType) {
          switch(klaviyoCustomerType) {
            case 'SINGLE_ORDER':
              probability += this.weightConfig.customerStatus.singleOrderBonus;
              weights.push({
                factor: "Klaviyo single order bonus",
                value: "N/A",
                percentage_applied: this.weightConfig.customerStatus.singleOrderBonus
              });
              break;
            case 'INACTIVE_REPEAT':
              probability += this.weightConfig.customerStatus.inactiveRepeatBonus;
              weights.push({
                factor: "Klaviyo inactive repeat bonus",
                value: "N/A",
                percentage_applied: this.weightConfig.customerStatus.inactiveRepeatBonus
              });
              break;
            case 'SUBSCRIBED_NO_ORDERS':
              probability += this.weightConfig.customerStatus.subscribedNoOrdersBonus;
              weights.push({
                factor: "Klaviyo subscribed no orders bonus",
                value: "N/A",
                percentage_applied: this.weightConfig.customerStatus.subscribedNoOrdersBonus
              });
              break;
            case 'UNSUBSCRIBED_NO_ORDERS':
              probability += this.weightConfig.customerStatus.unsubscribedNoOrdersBonus;
              weights.push({
                factor: "Klaviyo unsubscribed no orders bonus",
                value: "N/A",
                percentage_applied: this.weightConfig.customerStatus.unsubscribedNoOrdersBonus
              });
              break;
          }
        } else {
          // Completely unidentified customer
          probability += this.weightConfig.customerStatus.newCustomerBonus;
          weights.push({
            factor: "New unidentified customer bonus",
            value: "N/A",
            percentage_applied: this.weightConfig.customerStatus.newCustomerBonus
          });
        }
      }
  
      // Cart additions weight
      const cartWeight = this.state.cartItemCount * this.weightConfig.cartAdditions.increment;
      const appliedCartWeight = Math.min(cartWeight, this.weightConfig.cartAdditions.max);
      probability += appliedCartWeight;
      weights.push({
        factor: "Cart additions",
        value: this.state.cartItemCount,
        percentage_applied: appliedCartWeight
      });
  
      // Checkout visits weight
      const checkoutWeight = this.state.checkoutVisits * this.weightConfig.checkoutVisits.increment;
      const appliedCheckoutWeight = Math.min(checkoutWeight, this.weightConfig.checkoutVisits.max);
      probability += appliedCheckoutWeight;
      weights.push({
        factor: "Checkout visits",
        value: this.state.checkoutVisits,
        percentage_applied: appliedCheckoutWeight
      });
  
      // Time on site weight
      const timeIncrements = Math.floor(this.state.timeOnSite / this.weightConfig.timeOnSite.interval);
      const timeWeight = timeIncrements * this.weightConfig.timeOnSite.increment;
      const appliedTimeWeight = Math.min(timeWeight, this.weightConfig.timeOnSite.max);
      probability += appliedTimeWeight;
      weights.push({
        factor: "Time on site",
        value: this.state.timeOnSite,
        percentage_applied: appliedTimeWeight
      });
  
      // Products viewed weight
      const productWeight = this.state.productsViewed * this.weightConfig.productsViewed.increment;
      const appliedProductWeight = Math.min(productWeight, this.weightConfig.productsViewed.max);
      probability += appliedProductWeight;
      weights.push({
        factor: "Products viewed",
        value: this.state.productsViewed,
        percentage_applied: appliedProductWeight
      });
  
      // Search queries weight
      const searchWeight = this.state.searchesPerformed * this.weightConfig.searchesPerformed.increment;
      const appliedSearchWeight = Math.min(searchWeight, this.weightConfig.searchesPerformed.max);
      probability += appliedSearchWeight;
      weights.push({
        factor: "Search queries",
        value: this.state.searchesPerformed,
        percentage_applied: appliedSearchWeight
      });
  
      // Cart value weight
      let cartValueWeight = 0;
      if (window.shopifyCart?.total_price >= this.weightConfig.cartValue.threshold * 100) {
        cartValueWeight = this.weightConfig.cartValue.increment;
        probability += cartValueWeight;
      }
      weights.push({
        factor: "Cart value",
        value: window.shopifyCart?.total_price / 100,
        percentage_applied: cartValueWeight
      });
  
      // Near free shipping weight
      let nearFreeShippingWeight = 0;
      if (window.shopifyCart) {
        const difference = this.freeShippingThreshold - window.shopifyCart.total_price;
        if (difference > 0 && difference <= this.weightConfig.nearFreeShipping.threshold * 100) {
          nearFreeShippingWeight = this.weightConfig.nearFreeShipping.increment;
          probability += nearFreeShippingWeight;
        }
      }
      weights.push({
        factor: "Near free shipping",
        value: "N/A",
        percentage_applied: nearFreeShippingWeight
      });
  
      // Final capped probability
      const finalProbability = Math.min(probability, 100);
  
      console.group("🎲 Probability Calculation");
      GrawLogger.log("Base Probability:", this.probability);
      console.table(weights);
      GrawLogger.log("Final Probability:", finalProbability);
      console.groupEnd();
  
      return {
        probability: finalProbability,
        weights: weights
      };
    },
  
    evaluateGiftCardEligibility: function () {
      if (!this.canAllocateGiftCard()) {
        return;
      }
    
      const result = this.calculateProbability();
      const probability = result.probability;
      const weights = result.weights;
      
      const randomValue = Math.random() * 100;
      if (randomValue < probability) {
        GrawLogger.log(
          `Gift card allocation trigerred. Random probability of ${randomValue}% reached.`
        );
        this.triggerGiftCardEvent(probability, weights);
      }
    },
  
     triggerGiftCardEvent: async function(probability, weights) {
      try {
        const userId = UserIdentifier.getUserId();
        if (!userId) {
          GrawLogger.error("No user ID available");
          return;
        }
    
        // Now weights is in scope
        ConversationStateManager.triggerVoiceflowEvent(
          userId, 
          "giftCardAllocation", 
          { 
            probability,
            timestamp: new Date().toISOString(),
            currency_sign: window.shopifyCurrency?.symbol || "$",
            sessionData: JSON.stringify(weights)
          }
        ).catch(error => GrawLogger.error(error));
        
        localStorage.setItem('giftCardLastAllocationTime', Date.now().toString());
        this.state.lastAllocationTime = Date.now();
        this.state.allocationsThisSession++;
        this.saveAllocationData();
      } catch (error) {
        GrawLogger.error("Gift card allocation failed:", error);
      }
    },
  
    // Update saveAllocationData
    saveAllocationData: function () {
      try {
        localStorage.setItem(
          "giftCardAllocationData",
          JSON.stringify({
            sessionId: this.getSessionId(),
            state: this.state,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        GrawLogger.warn("Failed to save allocation data:", error);
      }
    },
    
    // Add new method to handle initial check timing
    getInitialCheckTime: function() {
      const storedTime = sessionStorage.getItem('gca_initial_check_time');
      if (storedTime) {
        return parseInt(storedTime, 10);
      }
      // If no stored time, set current time as initial check time
      const currentTime = Date.now();
      sessionStorage.setItem('gca_initial_check_time', currentTime.toString());
      return currentTime;
    },
  
    // Add new method to determine if initial check is needed
    needsInitialCheck: function() {
      const initialCheckTime = this.getInitialCheckTime();
      const timeElapsed = Date.now() - initialCheckTime;
      
      // If we haven't waited the initial check period yet
      if (timeElapsed < this.weightConfig.persistence.initialCheck) {
        return true;
      }
      
      // If we've never performed an initial check
      const initialCheckPerformed = sessionStorage.getItem('gca_initial_check_performed');
      return !initialCheckPerformed;
    },
  
    // Add new method to handle check scheduling
    scheduleNextCheck: function() {
      if (this.needsInitialCheck()) {
        // Schedule initial check
        const timeUntilInitialCheck = Math.max(
          0,
          this.weightConfig.persistence.initialCheck - 
          (Date.now() - this.getInitialCheckTime())
        );
  
        setTimeout(() => {
          this.evaluateGiftCardEligibility();
          sessionStorage.setItem('gca_initial_check_performed', 'true');
          
          // Start regular interval checks after initial check
          this.evaluationInterval = setInterval(() => {
            if (window.requestIdleCallback) {
              window.requestIdleCallback(this.evaluateGiftCardEligibility.bind(this));
            } else {
              this.evaluateGiftCardEligibility();
            }
          }, this.weightConfig.persistence.checkInterval);
        }, timeUntilInitialCheck);
      } else {
        // If initial check was already performed, just continue with regular interval
        this.evaluationInterval = setInterval(() => {
          if (window.requestIdleCallback) {
            window.requestIdleCallback(this.evaluateGiftCardEligibility.bind(this));
          } else {
            this.evaluateGiftCardEligibility();
          }
        }, this.weightConfig.persistence.checkInterval);
      }
    },
  
    init: async function() {
      if (window.GRAW_AI_SETTINGS && typeof window.GRAW_AI_SETTINGS.freeShippingThreshold === 'number') {
        this._freeShippingThreshold = window.GRAW_AI_SETTINGS.freeShippingThreshold;
      }
      // Check if we're on a product page first
      if (this.isProductPage()) {
        GrawLogger.log('On product page. Skipping gift card identification flow.');
        return;
      }
      
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve, { once: true });
        });
      }
    
      GrawLogger.log("Initializing GiftCardAllocator...");
      
      this.initializeSession();
      this.initializeState();
      
      await Promise.all([
        this.checkShopifyLogin(),
        this.waitForKlaviyoEligibility()
      ]);
    
      await this.checkCustomerEligibility();
      this.loadSavedState();
      this.setupCartTracking();
      this.setupCheckoutTracking();
      
      if (window.requestIdleCallback) {
        window.requestIdleCallback(this.setupEventListeners.bind(this));
      } else {
        setTimeout(this.setupEventListeners.bind(this), 1);
      }
    
      this.scheduleNextCheck();
    },
  
    waitForKlaviyoEligibility: function() {
      return new Promise(resolve => {
        const maxWaitTime = 5000; // 5 seconds max wait time
        const startTime = Date.now();
        
        const checkKlaviyoData = () => {
          if (sessionStorage.getItem('isKlaviyoEligible') !== null) {
            resolve();
            return;
          }
          
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime >= maxWaitTime) {
            resolve();
            return;
          }
          
          setTimeout(checkKlaviyoData, 100);
        };
        
        checkKlaviyoData();
      });
    },
    
    // Update initializeSession to use sessionStorage
    initializeSession: function() {
      const sessionId = sessionStorage.getItem("giftCardSessionId");
      if (!sessionId) {
        const newSessionId = Date.now().toString();
        sessionStorage.setItem("giftCardSessionId", newSessionId);
        GrawLogger.log("New session initialized:", newSessionId);
        
        // Initialize start time for new session
        this.startTime = Date.now();
        sessionStorage.setItem("siteStartTime", this.startTime.toString());
      } else {
        // Recover start time for existing session
        this.startTime = parseInt(sessionStorage.getItem("siteStartTime") || Date.now().toString(), 10);
      }
    },
  
  
    // Add cleanup method for page unload
    cleanup: function() {
      if (this.evaluationInterval) {
        clearInterval(this.evaluationInterval);
      }
    }
  };