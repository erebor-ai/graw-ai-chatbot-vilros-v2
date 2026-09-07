const UserIdentifier = {
  storageKey: 'vf_user_id',
  pathChangeKey: 'vf_last_path',
  _regenRanThisLoad: false,

  generateUserId: function() {
    return 'user_' + Math.random().toString(36).substring(2, 10) +
           Math.random().toString(36).substring(2, 10);
  },

  clearRelatedSessionStorage: function() {
    sessionStorage.removeItem('isKlaviyoEligible');
    sessionStorage.removeItem('shopifyCustomerProcessed');
    sessionStorage.removeItem('klaviyoCustomerType');
    GrawLogger.log('Cleared related session storage keys');
  },

  getUserId: function() {
    let userId = sessionStorage.getItem(this.storageKey);
    if (!userId) {
      userId = this.generateUserId();
      GrawLogger.log('Generated new user ID:', userId);
      sessionStorage.setItem(this.storageKey, userId);
    }
    return userId;
  },

  // Call this on page navigation to potentially mint a fresh userId.
  // Synchronous and instant — no network call.
  maybeRegenerateId: function() {
    // Prevent double-firing if called before and then again via init()
    if (this._regenRanThisLoad) {
      GrawLogger.log('UserIdentifier: maybeRegenerateId already ran this load, skipping.');
      return;
    }
    this._regenRanThisLoad = true;

    const currentPath = window.location.pathname + window.location.search;
    const lastPath = sessionStorage.getItem(this.pathChangeKey);
    sessionStorage.setItem(this.pathChangeKey, currentPath);

    if (lastPath && currentPath === lastPath) {
      GrawLogger.log('UserIdentifier: Path unchanged, skipping regen.');
      return;
    }

    if (typeof ConversationStateManager !== 'undefined') {
      if (ConversationStateManager.isWidgetOpen()) {
        GrawLogger.log('UserIdentifier: Widget open, keeping ID.');
        return;
      }
      if (ConversationStateManager.hasOngoingConversation()) {
        GrawLogger.log('UserIdentifier: Conversation ongoing, keeping ID.');
        return;
      }
    }

    const newUserId = this.generateUserId();
    sessionStorage.setItem(this.storageKey, newUserId);
    this.clearRelatedSessionStorage();
    GrawLogger.log('UserIdentifier: Regenerated user ID:', newUserId);

    if (typeof customerIdentifier !== 'undefined') {
      setTimeout(() => { customerIdentifier.init(); }, 500);
    }
  },

  init: function() {
    GrawLogger.log('Initializing UserIdentifier');
    this.getUserId();

    const initialPath = window.location.pathname + window.location.search;
    if (!sessionStorage.getItem(this.pathChangeKey)) {
      sessionStorage.setItem(this.pathChangeKey, initialPath);
    }

    // maybeRegenerateId() was already called before chat.load() — 
    // this call inside init() will be a no-op due to _regenRanThisLoad flag
    this.maybeRegenerateId();

    // SPA navigation listeners (still useful as insurance)
    if ('pushState' in window.history) {
      const originalPushState = window.history.pushState;
      window.history.pushState = function() {
        const result = originalPushState.apply(this, arguments);
        window.dispatchEvent(new Event('locationchange'));
        return result;
      };
      window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event('locationchange'));
      });
      window.addEventListener('locationchange', () => {
        // Reset flag for genuine SPA navigation within same page lifecycle
        UserIdentifier._regenRanThisLoad = false;
        UserIdentifier.maybeRegenerateId();
      });
    }
  }
};