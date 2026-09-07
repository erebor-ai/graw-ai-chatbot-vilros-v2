// ProactiveCloseWatcher.js (Updated for Shadow DOM)
// Listens for clicks on the Voiceflow proactive message close button inside the Shadow DOM.

const ProactiveCloseWatcher = {
    initialized: false,
    shadowRoot: null, // To store the found Shadow Root
    hostElementId: 'voiceflow-chat', // The ID of the element hosting the shadow root
    pollingInterval: null,
    maxPollingTime: 20000, // Wait a maximum of 20 seconds for the shadow root
  
    init: function() {
      if (this.initialized) {
        return;
      }
  
      // Check for dependencies immediately
      if (typeof ConversationStateManager === 'undefined' || typeof UserIdentifier === 'undefined') {
        GrawLogger.error("ProactiveCloseWatcher: Required dependencies (ConversationStateManager, UserIdentifier) missing.");
        // We can't proceed without dependencies, even if shadow root appears later
        return;
      }
  
      this.waitForShadowRoot();
      this.initialized = true; // Mark as initialized (attempting to find shadow root)
    },
  
    waitForShadowRoot: function() {
      const startTime = Date.now();
  
      this.pollingInterval = setInterval(() => {
        const hostElement = document.getElementById(this.hostElementId);
  
        if (hostElement && hostElement.shadowRoot) {
          this.shadowRoot = hostElement.shadowRoot;
          clearInterval(this.pollingInterval); // Stop polling
          this.attachListenerToShadowRoot(); // Attach the listener
        } else if (Date.now() - startTime > this.maxPollingTime) {
          GrawLogger.warn(`ProactiveCloseWatcher: Timed out waiting for Shadow DOM on #${this.hostElementId}. Listener not attached.`);
          clearInterval(this.pollingInterval); // Stop polling
        }
        // Else: continue polling
      }, 500); // Check every 500ms
    },
  
    attachListenerToShadowRoot: function() {
      if (!this.shadowRoot) {
        GrawLogger.error("ProactiveCloseWatcher: Cannot attach listener, Shadow Root not found.");
        return;
      }
  
      // Attach listener to the shadow root itself
      this.shadowRoot.addEventListener('click', this.handleClick.bind(this));
      // Note: No 'true' needed for capture phase here, bubbling within shadow root is fine.
    },
  
    handleClick: function(event) {
      // Now that the listener is ON the shadow root, event.target IS the element inside
      // Use the same selector strategy, but it will work correctly within the shadow DOM
      const closeButton = event.target.closest('div.vfrc-proactive button.vfrc-button._6r9xee5');
      // If the above is too specific/brittle, try just the button selector:
      // const closeButton = event.target.closest('button.vfrc-button._6r9xee5');
      // Or even more general if classes change often (less safe):
      // const closeButton = event.target.closest('div.vfrc-proactive button[class*="vfrc-button"]');
  
      if (closeButton) {
  
        const userId = UserIdentifier.getUserId();
  
        if (userId) {
          ConversationStateManager.checkConversationState(userId, 'emailCaptureMessage')
            .then(result => {
            })
            .catch(error => {
              GrawLogger.error("ProactiveCloseWatcher: Error calling checkConversationState after close.", error);
            });
        } else {
          GrawLogger.warn("ProactiveCloseWatcher: Could not get User ID after proactive close click.");
        }
      }
    }
  };