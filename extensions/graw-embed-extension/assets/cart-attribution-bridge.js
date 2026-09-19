// cart-attribution-bridge.js
// Writes chatbot attribution identifiers into cart attributes so they survive onto
// order.note_attributes for the orders/paid webhook — our theme scripts never run on
// Shopify's hosted checkout page, so this is how attribution data gets there.
(function() {
  'use strict';

  const CartAttributionBridge = {
    lastSynced: null,

    getConversationState: function() {
      const conversationOngoing = sessionStorage.getItem('graw_conversation_ongoing') === 'true';
      const userId = sessionStorage.getItem('vf_user_id') || null;
      const sessionId = sessionStorage.getItem('graw_session_id') || null;

      if (conversationOngoing) {
        return {
          hasRecentInteraction: true,
          attributionType: 'ongoing_conversation',
          userId, sessionId,
          lastInteraction: new Date().toISOString(),
          firstInteraction: null,
          interactionCount: null
        };
      }

      try {
        const stored = JSON.parse(localStorage.getItem('graw_chat_attribution') || 'null');
        if (stored?.lastInteraction) {
          const hoursSince = (Date.now() - new Date(stored.lastInteraction).getTime()) / (1000 * 60 * 60);
          if (hoursSince <= 24) {
            return {
              hasRecentInteraction: true,
              attributionType: 'within_window',
              userId: stored.userId || userId,
              sessionId,
              lastInteraction: stored.lastInteraction,
              firstInteraction: stored.firstInteraction,
              interactionCount: stored.interactionCount
            };
          }
        }
      } catch (e) {
        GrawLogger.warn('GRAW AI: Error reading chat attribution data for cart bridge', e);
      }

      return { hasRecentInteraction: false };
    },

    syncNow: function() {
      const state = this.getConversationState();
      if (!state.hasRecentInteraction) return;

      // Skip redundant /cart/update.js calls when nothing has actually changed.
      const signature = `${state.attributionType}:${state.userId}:${state.lastInteraction}`;
      if (signature === this.lastSynced) return;
      this.lastSynced = signature;

      fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attributes: {
            graw_user_id: state.userId || '',
            graw_session_id: state.sessionId || '',
            graw_attribution_type: state.attributionType || '',
            graw_last_interaction: state.lastInteraction || '',
            graw_first_interaction: state.firstInteraction || '',
            graw_interaction_count: state.interactionCount != null ? String(state.interactionCount) : ''
          }
        })
      }).catch(error => GrawLogger.warn('GRAW AI: Failed to sync cart attribution attributes', error));
    },

    init: function() {
      this.syncNow();
      window.addEventListener('conversationStateChanged', () => this.syncNow());
    }
  };

  window.GrawCartAttributionBridge = CartAttributionBridge;
  CartAttributionBridge.init();
})();
