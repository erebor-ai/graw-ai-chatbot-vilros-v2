// add-to-cart-tracker.js
// Captures add-to-cart attribution at the network layer (POST /cart/add[.js]) instead of via
// the sandboxed Web Pixel, so tracking survives even if another app's script breaks Shopify's
// Web Pixels Manager on a given page (e.g. product pages).
(function() {
  'use strict';

  const AddToCartTracker = {
    config: {
      endpoint: '/apps/voiceflow',
      cartAddPathPattern: /\/cart\/add(\.js)?(\?|$)/
    },

    init: function() {
      this.patchFetch();
      this.patchXHR();
      GrawLogger.log('GRAW AI: Add-to-cart tracker initialized (network-level capture)');
    },

    isCartAddRequest: function(url, method) {
      if (!url || (method && method.toUpperCase() !== 'POST')) return false;
      try {
        const path = new URL(url, window.location.origin).pathname;
        return this.config.cartAddPathPattern.test(path);
      } catch (e) {
        return this.config.cartAddPathPattern.test(url);
      }
    },

    patchFetch: function() {
      if (!window.fetch || window.fetch.__grawPatched) return;
      const originalFetch = window.fetch.bind(window);
      const self = this;

      const patchedFetch = function(input, init) {
        const url = typeof input === 'string' ? input : input?.url;
        const method = init?.method || (typeof input !== 'string' && input?.method) || 'GET';
        const promise = originalFetch(input, init);

        if (self.isCartAddRequest(url, method)) {
          promise
            .then(response => {
              if (!response.ok) return;
              response.clone().json()
                .then(data => self.handleCartAdd(data))
                .catch(err => GrawLogger.warn('GRAW AI: Could not parse cart/add response', err));
            })
            .catch(() => {});
        }

        return promise;
      };
      patchedFetch.__grawPatched = true;
      window.fetch = patchedFetch;
    },

    patchXHR: function() {
      if (XMLHttpRequest.prototype.__grawPatched) return;
      const self = this;
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function(method, url) {
        this.__grawIsCartAdd = self.isCartAddRequest(url, method);
        return originalOpen.apply(this, arguments);
      };

      XMLHttpRequest.prototype.send = function(body) {
        if (this.__grawIsCartAdd) {
          this.addEventListener('load', function() {
            if (this.status >= 200 && this.status < 300) {
              try {
                self.handleCartAdd(JSON.parse(this.responseText));
              } catch (e) {
                GrawLogger.warn('GRAW AI: Could not parse cart/add XHR response', e);
              }
            }
          });
        }
        return originalSend.apply(this, arguments);
      };
      XMLHttpRequest.prototype.__grawPatched = true;
    },

    handleCartAdd: function(data) {
      // /cart/add.js returns a single item object, or { items: [...] } for multi-variant adds
      const items = Array.isArray(data?.items) ? data.items : [data];
      items.forEach(item => {
        if (item && item.id) this.trackAddToCart(item);
      });
    },

    trackAddToCart: function(item) {
      const conversationState = this.getConversationState();
      if (!conversationState.hasRecentInteraction) {
        GrawLogger.log('GRAW AI: Add-to-cart detected, no recent chatbot interaction, skipping attribution');
        return;
      }

      this.sendToAPI({
        eventType: 'add_to_cart',
        attributionType: conversationState.attributionType,
        conversationOngoing: conversationState.isOngoing,
        userId: conversationState.userId,
        sessionId: conversationState.sessionId,
        firstInteraction: conversationState.firstInteraction,
        lastInteraction: conversationState.lastInteraction,
        interactionCount: conversationState.interactionCount,
        daysSinceInteraction: conversationState.daysSinceInteraction,
        productId: item.product_id,
        productTitle: item.product_title || item.title,
        variantId: item.variant_id || item.id,
        variantTitle: item.variant_title,
        quantity: item.quantity,
        price: typeof item.price === 'number' ? item.price / 100 : null,
        currency: window.Shopify?.currency?.active || window.GRAW_AI_SETTINGS?.shopCurrency
      });
    },

    /**
     * Same "ongoing or within 24h window" logic the Web Pixel used, but reading
     * storage directly since this runs in the main page context, not a sandbox.
     */
    getConversationState: function() {
      const conversationOngoing = sessionStorage.getItem('graw_conversation_ongoing') === 'true';
      // 'vf_user_id' is the actual identifier UserIdentifier writes; 'graw_user_id' is never set.
      const userId = sessionStorage.getItem('vf_user_id') || sessionStorage.getItem('graw_user_id') || null;
      const sessionId = sessionStorage.getItem('graw_session_id') || null;

      if (conversationOngoing) {
        return {
          hasRecentInteraction: true,
          isOngoing: true,
          attributionType: 'ongoing_conversation',
          userId, sessionId,
          firstInteraction: null,
          lastInteraction: null,
          interactionCount: null,
          daysSinceInteraction: null
        };
      }

      try {
        const stored = JSON.parse(localStorage.getItem('graw_chat_attribution') || 'null');
        if (stored?.lastInteraction) {
          const hoursSince = (Date.now() - new Date(stored.lastInteraction).getTime()) / (1000 * 60 * 60);
          if (hoursSince <= 24) {
            return {
              hasRecentInteraction: true,
              isOngoing: false,
              attributionType: 'within_window',
              userId: stored.userId || userId,
              sessionId,
              firstInteraction: stored.firstInteraction,
              lastInteraction: stored.lastInteraction,
              interactionCount: stored.interactionCount,
              daysSinceInteraction: hoursSince / 24
            };
          }
        }
      } catch (e) {
        GrawLogger.warn('GRAW AI: Error reading chat attribution data', e);
      }

      return { hasRecentInteraction: false };
    },

    sendToAPI: function(data) {
      // Main-page context has access to GRAW_AI_SETTINGS, so this always uses the
      // canonical *.myshopify.com domain rather than whatever the storefront hostname is.
      const shopDomain = window.GRAW_AI_SETTINGS?.shopDomain || window.Shopify?.shop;
      if (!shopDomain) {
        GrawLogger.warn('GRAW AI: No shop domain available, skipping add-to-cart attribution');
        return;
      }

      const endpoint = `${this.config.endpoint}?action=trackAddToCart&shop=${shopDomain}`;

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      })
      .then(response => {
        if (!response.ok) GrawLogger.warn('GRAW AI: Failed to send add-to-cart attribution');
      })
      .catch(error => GrawLogger.error('GRAW AI: Error sending add-to-cart attribution:', error));
    }
  };

  window.GrawAddToCartTracker = AddToCartTracker;

  // Patch fetch/XHR as early as possible; don't wait on the Voiceflow widget bootstrap.
  AddToCartTracker.init();
})();
