const CartDataCollector = {
    // Base configuration
    //thresholdTime: 5000, // 5 seconds
  
    getCartData: function() {
      const cart = window.shopifyCart;
      
      if (!cart) {
        GrawLogger.warn("No cart data found in window.shopifyCart");
        return null;
      }
  
      return {
        empty: cart.item_count === 0,
        itemCount: cart.item_count,
        items: cart.items.map(item => ({
          title: item.title,
          product_id: item.product_id
        })),
        totalPrice: cart.total_price
      };
    }
  };
  
  // CartPageEventHandler refactored to use ConversationStateManager
  const CartPageEventHandler = {
    timer: null,
    currentCartData: null,
    _thresholdTime: 5000, // Default fallback (in milliseconds)

    init: function() {
      // Set threshold time from global settings if available
      const thresholdTime = window.GRAW_AI_SETTINGS?.cartPageThresholdTime;
      if (thresholdTime !== undefined) {
          this._thresholdTime = thresholdTime;
          GrawLogger.log(`GRAW AI (CartPageEventHandler): cartPageThresholdTime set to: ${this._thresholdTime}ms`);
      }

      if (this.isCartPage()) {
        const cartData = CartDataCollector.getCartData();
        if (cartData) {
          this.startCartPageTimer(cartData);
        } else {
          GrawLogger.warn("No cart data available");
        }
      } else {
        GrawLogger.log("Not on cart page");
      }
    },
  
    isCartPage: function() {
      return window.location.pathname.includes("/cart");
    },
  
    startCartPageTimer: function(cartData) {
      this.currentCartData = cartData;
      clearTimeout(this.timer);
  
      this.timer = setTimeout(() => {
        this.triggerCartPageEvent();
      }, this._thresholdTime);
    },
  
    triggerCartPageEvent: async function() {
      if (!this.currentCartData) {
        GrawLogger.error("No cart data available when triggering event");
        return;
      }
  
      // Get user ID
      const userId = UserIdentifier.getUserId();
      
      if (!userId) {
        GrawLogger.error("No user ID available");
        return;
      }
  
      // Use ConversationStateManager to safely trigger the event
      ConversationStateManager.triggerVoiceflowEvent(
        userId, 
        "userOnCartPage", 
        { cartData: JSON.stringify(this.currentCartData) }
      ).catch(error => GrawLogger.error(error));
    }
  };