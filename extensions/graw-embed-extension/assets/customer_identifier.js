const customerIdentifier = {
  _inactivityThresholdMonths: 3,

  
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
  
    checkShopifyCustomer: async function() {
      try {
        // Skip processing on product pages
  //      if (this.isProductPage()) {
  //        GrawLogger.log('On product page. Skipping Shopify customer check.');
  //        return false;
  //      }
  
        if (sessionStorage.getItem('shopifyCustomerProcessed')) {
          GrawLogger.log('Shopify customer already processed. Skipping.');
          return true;
        }
  
        if (window.customerData && window.customerData.customer) {
          const customerData = window.customerData.customer;
          GrawLogger.log("Found logged-in Shopify customer:", customerData);
  
          let customerType = 'NONE';
          if (customerData.orders && customerData.orders.length > 0) {
            const sortedOrders = [...customerData.orders].sort((a, b) => {
              const getDate = (order) => {
                if (Array.isArray(order.created_at)) {
                  const [seconds, minutes, hours, day, month, year] = order.created_at;
                  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
                }
                return new Date(order.created_at);
              };
              return getDate(b) - getDate(a);
            });
  
            const lastOrder = sortedOrders[0];
            const lastOrderDate = Array.isArray(lastOrder.created_at)
              ? new Date(Date.UTC(...lastOrder.created_at))
              : new Date(lastOrder.created_at);
            
            const now = new Date();
            const monthsSinceLastOrder = (now - lastOrderDate) / (1000 * 60 * 60 * 24 * 30);
            
            if (monthsSinceLastOrder >= this.INACTIVITY_THRESHOLD) {
              customerType = 'INACTIVE_REPEAT';
            }
          } else {
            customerType = 'NO_ORDERS';
          }
  
          const userId = UserIdentifier.getUserId();
          if(!userId) {
            GrawLogger.error("No user ID available");
            return false;
          }
  
          // Send customer data to Voiceflow
          const success = await ConversationStateManager.triggerVoiceflowEvent(
            userId,
            'getShopifyData',
            {
              email: customerData.email,
              customerId: customerData.id.toString(),
              firstName: customerData.firstName,
              lastName: customerData.lastName,
              acceptsMarketing: customerData.acceptsMarketing,
              customerType: customerType
            }
          );
  
          if (success) {
            sessionStorage.setItem('shopifyCustomerProcessed', 'true');
            return true;
          }
        }
        return false;
      } catch (error) {
        GrawLogger.error('Error checking Shopify customer:', error);
        return false;
      }
    },
  
    getKlaId: function() {
      try {
        const kla_id_cookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('__kla_id='));
  
        if (!kla_id_cookie) {
          GrawLogger.warn('No __kla_id cookie found');
          return null;
        }
  
        const kla_id = kla_id_cookie.split('=')[1];
        const decoded_kla_id = atob(kla_id);
        const kla_id_data = JSON.parse(decoded_kla_id);
        const exchange_id = kla_id_data["$exchange_id"];
        
        if (!exchange_id) {
          return null;
        }
        return exchange_id;
      } catch (error) {
        GrawLogger.error('Error extracting Klaviyo exchange ID:', error);
        return null;
      }
    },
  
    triggerEligibilityCheck: async function() {
      // Skip processing on product pages
  //    if (this.isProductPage()) {
  //      GrawLogger.log('On product page. Skipping Klaviyo eligibility check.');
  //      return;
  //    }
  
      if (sessionStorage.getItem('isKlaviyoEligible')) {
        GrawLogger.log('Klaviyo eligibility already checked. Skipping.');
        return;
      }
  
      const exchangeId = this.getKlaId();
      if (!exchangeId) {
        GrawLogger.warn('No Klaviyo exchange ID found. Cannot check eligibility.');
        return;
      }
  
      const userId = UserIdentifier.getUserId();
      if(!userId) {
        GrawLogger.error("No user ID available");
        return;
      }
  
      const success = await ConversationStateManager.triggerVoiceflowEvent(
        userId,
        'getKlaviyoData',
        {
          inactivityThreshold: this.INACTIVITY_THRESHOLD,
          exchangeId: exchangeId
        }
      );
  
      if (success) {
        sessionStorage.setItem('isKlaviyoEligible', 'true');
      }
    },
  
    init: function() {

      if (window.GRAW_AI_SETTINGS && typeof window.GRAW_AI_SETTINGS.inactiveCustomerMonths === 'number') {
        this._inactivityThresholdMonths = window.GRAW_AI_SETTINGS.inactiveCustomerMonths;
      }
      
      // Check if we're on a product page first
      if (this.isProductPage()) {
        GrawLogger.log('On product page. Skipping customer identification flow.');
        return;
      }
      
      // First check if we have Shopify customer data
      this.checkShopifyCustomer().then(shopifySuccess => {
        // Only check Klaviyo if we don't have Shopify data
        if (!shopifySuccess) {
          GrawLogger.log('No Shopify customer data found, checking Klaviyo');
          this.triggerEligibilityCheck();
        } else {
          GrawLogger.log('Shopify customer data found, skipping Klaviyo check');
        }
      }).catch(error => {
        GrawLogger.error('Error in customer identification flow:', error);
        // Fall back to Klaviyo check if Shopify check errors out
        this.triggerEligibilityCheck();
      });
    }
  };