import {register} from "@shopify/web-pixels-extension";

register(({ analytics, browser, settings }) => {
  //console.log('GRAW AI: Cart Attribution Pixel initialized');
  
  // Storage keys
  const STORAGE_KEYS = {
    conversationOngoing: 'graw_conversation_ongoing',
    sessionId: 'graw_session_id',
    userId: 'graw_user_id',
    chatAttribution: 'graw_chat_attribution'
  };
  
  // Subscribe to add to cart events
  analytics.subscribe('product_added_to_cart', async (event) => {
    //console.log('GRAW AI: Product added to cart event received', event);
    
    try {
      // Get conversation state from browser storage
      const conversationState = await getConversationState('product_added_to_cart');
      
      if (!conversationState.hasRecentInteraction) {
        //console.log('GRAW AI: No recent chatbot interaction, skipping attribution');
        return;
      }
      
      //console.log('GRAW AI: Attributing cart addition to chatbot interaction', conversationState);
      
      // Prepare cart-specific data
      const cartData = {
        productId: event.data?.cartLine?.merchandise?.product?.id,
        productTitle: event.data?.cartLine?.merchandise?.product?.title,
        variantId: event.data?.cartLine?.merchandise?.id,
        variantTitle: event.data?.cartLine?.merchandise?.title,
        quantity: event.data?.cartLine?.quantity,
        price: event.data?.cartLine?.cost?.totalAmount?.amount,
        currency: event.data?.cartLine?.cost?.totalAmount?.currencyCode
      };
      
      // Build attribution data
      const attributionData = {
        eventType: 'add_to_cart',
        attributionType: conversationState.attributionType,
        timestamp: new Date().toISOString(),
        conversationOngoing: conversationState.isOngoing,
        userId: conversationState.userId,
        sessionId: conversationState.sessionId,
        shopDomain: event.context?.document?.location?.hostname || 'unknown',
        firstInteraction: conversationState.firstInteraction,
        lastInteraction: conversationState.lastInteraction,
        interactionCount: conversationState.interactionCount,
        daysSinceInteraction: conversationState.daysSinceInteraction,
        ...cartData
      };
      
      // Send to API
      await sendToAPI(attributionData, 'trackAddToCart');
      
    } catch (error) {
      console.error('GRAW AI: Error in cart attribution tracking:', error);
    }
  });

  // Subscribe to checkout completed events
  analytics.subscribe('checkout_completed', async (event) => {
    //console.log('GRAW AI: Checkout completed event received', event);

    try {
      // Get conversation state from browser storage, specifying the event type
      const conversationState = await getConversationState('checkout_completed');

      if (!conversationState.hasRecentInteraction) {
        //console.log('GRAW AI: No recent chatbot interaction, skipping checkout attribution');
        return;
      }

      //console.log('GRAW AI: Attributing checkout completion to chatbot interaction', conversationState);

      const checkout = event.data.checkout;

      // Prepare checkout-specific data
      const checkoutData = {
        checkoutToken: checkout.token,
        orderId: checkout.order?.id,
        price: checkout.totalPrice?.amount,
        currency: checkout.totalPrice?.currencyCode,
      };

      // Build attribution data
      const attributionData = {
        eventType: 'checkout_completed',
        attributionType: conversationState.attributionType,
        timestamp: new Date().toISOString(),
        shopDomain: event.context?.document?.location?.hostname || 'unknown',
        ...conversationState,
        ...checkoutData
      };

      await sendToAPI(attributionData, 'trackCheckoutCompleted');
    } catch (error) {
      console.error('GRAW AI: Error in checkout completed attribution tracking:', error);
    }
  });
  
  /**
   * Get conversation state from browser storage
   */
  async function getConversationState(eventType: 'product_added_to_cart' | 'checkout_completed') {
    try {
      // Check if conversation is currently ongoing (from sessionStorage)
      const conversationOngoing = await browser.sessionStorage.getItem(STORAGE_KEYS.conversationOngoing);
      
      if (conversationOngoing === 'true') {
        const userId = await browser.sessionStorage.getItem(STORAGE_KEYS.userId);
        const sessionId = await browser.sessionStorage.getItem(STORAGE_KEYS.sessionId);
        
        return {
          hasRecentInteraction: true,
          isOngoing: true,
          attributionType: 'ongoing_conversation',
          userId: userId || null,
          sessionId: sessionId || null,
          firstInteraction: null,
          lastInteraction: null,
          interactionCount: null,
          daysSinceInteraction: null
        };
      }
      
      // Check for recent interactions (from localStorage - 24 hour window)
      const storedDataStr = await browser.localStorage.getItem(STORAGE_KEYS.chatAttribution);
      
      if (storedDataStr) {
        const storedData = JSON.parse(storedDataStr);
        
        if (storedData.lastInteraction) {
          const hoursSinceInteraction = 
            (Date.now() - new Date(storedData.lastInteraction).getTime()) / (1000 * 60 * 60);
          
          // 24 hour attribution window
          if (hoursSinceInteraction <= 24) {
            return {
              hasRecentInteraction: true,
              isOngoing: false,
              attributionType: 'within_window',
              userId: storedData.userId || null,
              sessionId: storedData.sessionId || null,
              firstInteraction: storedData.firstInteraction,
              lastInteraction: storedData.lastInteraction,
              interactionCount: storedData.interactionCount,
              daysSinceInteraction: hoursSinceInteraction / 24
            };
          }
        }
      }
      
      return { hasRecentInteraction: false };
      
    } catch (error) {
      console.error('GRAW AI: Error getting conversation state:', error);
      return { hasRecentInteraction: false };
    }
  }
  
  /**
   * Send attribution data to API
   */
  function sendToAPI(data: any, action: 'trackAddToCart' | 'trackCheckoutCompleted') {
    const appUrl = settings.app_url; // Get the app URL from settings
    if (!appUrl) {
      console.error('GRAW AI: App URL not configured in web pixel settings.');
      return;
    }
    try {
      const endpoint = `${appUrl}/api/voiceflow?action=${action}&shop=${data.shopDomain}`;
      
      console.log('GRAW AI: Sending cart attribution data to:', endpoint);
      
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
          return response.json();
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      })
      .then(result => {
        //console.log('GRAW AI: Cart attribution sent successfully:', result);
      })
      .catch(error => {
        // Enhanced logging
        console.error('GRAW AI: Error sending cart attribution:', {
          message: error.message,
          stack: error.stack,
          errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error))
        });
      });
    } catch (error) {
      console.error('GRAW AI: Error in sendToAPI:', error);
    }
  }
});