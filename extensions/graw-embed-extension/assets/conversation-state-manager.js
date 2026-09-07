// ConversationStateManager.js
const ConversationStateManager = {
    // Public property for other scripts to access
    isConversationOngoing: false,
    
    // Cache for conversation state to reduce API calls
    cache: {
      timestamp: 0,
      isConversationOngoing: null,
      ttl: 3000, // 3 seconds TTL for cache
    },
  
    // Check if the chat widget is visibly open
    isWidgetOpen: function() {
      const shadowElements = Array.from(document.querySelectorAll("*"))
        .filter((el) => el.shadowRoot)
        .map((el) => el.shadowRoot);

      for (const shadowRoot of shadowElements) {
        const widgetElement = shadowRoot.querySelector(".vfrc-widget");
        if (widgetElement) {
          // Current UI check (verified against live DOM)
          if (widgetElement.classList.contains("ck2fbe1")) {
            return true; // Widget is open
          }
          // Old UI check — kept as a defensive fallback only
          const classList = widgetElement.classList.toString();
          if (classList.includes("withChat-true")) {
            return true;
          }
        }
      }
      return false; // Widget not found or minimized
    },

    hasOngoingConversation: function() {
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('voiceflow-session-')) {
            const session = JSON.parse(sessionStorage.getItem(key));
            if (session?.turns?.some(turn => turn.type === 'user')) {
              return true;
            }
          }
        }
      } catch (e) {
        GrawLogger.warn('Error reading Voiceflow session data:', e);
      }
      return false;
    },
  
    // Check if a conversation is ongoing via backend API
    checkConversationState: function(userId = null, eventName = null) {
      const isOngoing = this.hasOngoingConversation();
      const isWidgetOpen = this.isWidgetOpen();
      this.updateConversationState(isOngoing || isWidgetOpen);
      return { isConversationOngoing: isOngoing, fallbackUsed: false };
    },
  
    // Fallback method to check conversation state if API fails
    fallbackCheck: function() {
      const shadowElements = Array.from(document.querySelectorAll("*"))
        .filter((el) => el.shadowRoot)
        .map((el) => el.shadowRoot);
    
      for (const shadowRoot of shadowElements) {
        const chatDialog = shadowRoot.querySelector(".vfrc-chat--dialog");
        if (chatDialog) {
          // New UI check
          if (chatDialog.children.length > 1) {
            return true; // Conversation ongoing (new UI)
          } else {
              //Check if new UI is present, and return false if it is.
              if(chatDialog.children.length === 1){
                  return false;
              }
          }
        }
        // Old UI check (only if new UI was not found)
        const loaderElement = shadowRoot.querySelector(".vfrc-loader");
        if (loaderElement === null && chatDialog === null) {
          return true; // Conversation ongoing (old UI)
        }
      }
      return false; // No conversation found
    },
  
    // --- Event Throttling Helpers ---
    _getSessionEventCount: function() {
      try {
        const count = sessionStorage.getItem('graw_session_event_count');
        return count ? parseInt(count, 10) : 0;
      } catch (e) {
        return 0;
      }
    },
  
    _incrementSessionEventCount: function() {
      try {
        const currentCount = this._getSessionEventCount();
        sessionStorage.setItem('graw_session_event_count', (currentCount + 1).toString());
      } catch (e) {
        GrawLogger.warn("Could not increment session event count in sessionStorage.");
      }
    },
    // --- End Throttling Helpers ---

// Safe method to trigger Voiceflow events
    triggerVoiceflowEvent: async function (userId, eventName, payload = {}) {
      if (!window.voiceflow?.chat) {
        GrawLogger.error("Voiceflow chat not available");
        return false;
      }

      // --- Throttling/sampling logic ---
      // We remove 'productOutOfStock' from this array so it isn't restricted to once-per-session.
      const EXEMPT_FROM_SAMPLING = ['getShopifyData', 'getKlaviyoData']; 
      const isExemptFromSampling = EXEMPT_FROM_SAMPLING.includes(eventName);
      
      // If the event is 'productOutOfStock', it already passed the 1% check upstream. 
      // We bypass the session caps entirely.
      if (eventName !== 'productOutOfStock') {
        const MAX_EVENTS_PER_SESSION = 3;
        const eventCount = this._getSessionEventCount();
        
        if (eventCount >= MAX_EVENTS_PER_SESSION) {
          GrawLogger.log(`GRAW Event Throttling: Skipping '${eventName}'. Session cap reached.`);
          return false;
        }
        
        if (isExemptFromSampling) {
          const eventFiredKey = `graw_event_fired_${eventName}`;
          if (sessionStorage.getItem(eventFiredKey)) {
            GrawLogger.log(`GRAW Event Throttling: Skipping '${eventName}'. Already fired this session.`);
            return false;
          }
        } else {
          const samplingRate = window.GRAW_AI_SETTINGS?.eventSamplingRate ?? 1.0;
          if (Math.random() > samplingRate) {
            GrawLogger.log(`GRAW Event Sampling: Skipping '${eventName}'.`);
            return false;
          }
        }
      }
      // --- End throttling ---

      // Local session check — no network call
      const isConversationOngoing = this.hasOngoingConversation();
      const isWidgetOpen = this.isWidgetOpen();

      // Update the shared property so attribution tracker stays in sync
      this.updateConversationState(isConversationOngoing || isWidgetOpen);

      if (!isConversationOngoing && !isWidgetOpen) {
        window.voiceflow.chat.interact({
          type: "event",
          payload: { event: { name: eventName, ...payload } },
        });
        GrawLogger.log(`Voiceflow event '${eventName}' triggered successfully.`);
        
        // Only increment the global session limit for standard events
        if (eventName !== 'productOutOfStock') {
          this._incrementSessionEventCount();
        }
        
        if (isExemptFromSampling) {
          try { sessionStorage.setItem(`graw_event_fired_${eventName}`, 'true'); } catch (e) {}
        }
        return true;
      } else {
        GrawLogger.log(
          `Skipping event '${eventName}':`,
          isConversationOngoing ? "conversation ongoing" : "",
          isWidgetOpen ? "widget open" : ""
        );
        return false;
      }
    },
    
    // Update conversation state and notify other scripts
    updateConversationState: function(isOngoing) {
      const previousState = this.isConversationOngoing;
      this.isConversationOngoing = isOngoing;
      
      // Store in sessionStorage for cross-tab/script access
      sessionStorage.setItem('graw_conversation_ongoing', isOngoing.toString());
      
      // Fire custom event if state changed
      if (previousState !== isOngoing) {
        window.dispatchEvent(new CustomEvent('conversationStateChanged', {
          detail: { isOngoing: isOngoing }
        }));
        GrawLogger.log('Conversation state changed:', isOngoing);
      }
    },
    
    // Initialize state on load
    init: function() {
      // Load initial state from sessionStorage
      const storedState = sessionStorage.getItem('graw_conversation_ongoing');
      if (storedState !== null) {
        this.isConversationOngoing = storedState === 'true';
      }
      
      // Monitor widget state changes
      setInterval(() => {
        const isOpen = this.isWidgetOpen();
        if (isOpen && !this.isConversationOngoing) {
          this.updateConversationState(true);
        }
      }, 1000);
    }
  };
  
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ConversationStateManager.init());
  } else {
    ConversationStateManager.init();
  }
