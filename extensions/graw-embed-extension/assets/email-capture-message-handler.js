// Email Capture Event Handler (Updated: Only runs for new customers)
const EmailCaptureEventHandler = {
    // Constants
    FIRST_TRIGGER_TIME: 60000, // 1 minute
    SECOND_TRIGGER_TIME: 120000, // 2 minutes
    EVENT_NAME: 'emailCaptureMessage',
    initialized: false, // Renamed for clarity
    messageSent: false, // Track if a message has been sent
  
    init: function() {
      // Prevent duplicate initialization
      if (this.initialized) return;
  
      // Check for required dependencies
      if (
        typeof ConversationStateManager === 'undefined' ||
        typeof UserIdentifier === 'undefined'
      ) {
        GrawLogger.error("EmailCaptureEventHandler: Required dependencies missing.");
        return;
      }
  
      GrawLogger.log("EmailCaptureEventHandler: Initializing...");
  
      // --- Determine Customer Status ---
      let isNewCustomerString = sessionStorage.getItem('new_customer');
  
      if (isNewCustomerString === null) {
        // Status not in session storage, determine from window object
        // Ensure window.customerData is available, otherwise default to assuming 'new' or handle as error
        const isNew = window.customerData ? !window.customerData.isReturningVisitor : true; // Default to true if data missing? Or false? Choose based on desired default behaviour. Let's default to true for now to attempt capture if unsure.
        isNewCustomerString = isNew ? 'true' : 'false';
        sessionStorage.setItem('new_customer', isNewCustomerString);
        GrawLogger.log(`EmailCaptureEventHandler: Determined customer status from window.customerData. Is New: ${isNewCustomerString}`);
      } else {
        GrawLogger.log(`EmailCaptureEventHandler: Retrieved customer status from sessionStorage. Is New: ${isNewCustomerString}`);
      }
  
      // --- Check if Customer is New ---
      if (isNewCustomerString !== 'true') {
        GrawLogger.log("EmailCaptureEventHandler: Customer is identified as returning. Halting email capture initialization.");
        // We don't set initialized = true, so it could potentially re-run init if called again,
        // but it will just hit this check again. This is fine.
        return; // Exit initialization if not a new customer
      }
  
      // --- Proceed with Initialization for New Customers ---
      GrawLogger.log("EmailCaptureEventHandler: Customer is new. Proceeding with timer setup.");
      this.initialized = true; // Mark as initialized *only* if customer is new
      this.startFirstTimer();
    },
  
    startFirstTimer: function() {
      GrawLogger.log(`EmailCaptureEventHandler: Setting first timer for ${this.FIRST_TRIGGER_TIME / 1000} seconds.`);
      setTimeout(() => {
        // 50% chance of triggering after first minute
        if (Math.random() < 0.5) {
          GrawLogger.log("EmailCaptureEventHandler: First timer triggered (50% chance successful).");
          this.triggerEmailCaptureEvent().then(success => {
            if (success) {
              this.messageSent = true;
              GrawLogger.log("EmailCaptureEventHandler: First message sent, skipping second timer.");
            } else {
              // Set up second timer only if first message wasn't sent (e.g., convo was ongoing)
              this.startSecondTimer();
            }
          });
        } else {
          GrawLogger.log("EmailCaptureEventHandler: First timer triggered but 50% chance did not attempt event.");
          // Set up second timer since first one didn't trigger the event
          this.startSecondTimer();
        }
      }, this.FIRST_TRIGGER_TIME);
    },
  
    startSecondTimer: function() {
      // Don't set second timer if a message was already sent
      if (this.messageSent) {
        GrawLogger.log("EmailCaptureEventHandler: Message already sent, not setting second timer.");
        return;
      }
  
      const remainingTime = this.SECOND_TRIGGER_TIME - this.FIRST_TRIGGER_TIME;
      GrawLogger.log(`EmailCaptureEventHandler: Setting second timer for additional ${remainingTime / 1000} seconds.`);
  
      setTimeout(() => {
        // Another 50% chance, only if no message sent yet
        if (Math.random() < 0.5 && !this.messageSent) {
          GrawLogger.log("EmailCaptureEventHandler: Second timer triggered (50% chance successful).");
          this.triggerEmailCaptureEvent(); // Don't need to chain timers further
        } else {
          GrawLogger.log("EmailCaptureEventHandler: Second timer triggered but did not attempt event (50% chance fail or message already sent).");
        }
      }, remainingTime);
    },
  
    triggerEmailCaptureEvent: async function() {
      const userId = UserIdentifier.getUserId();
      if (!userId) {
        GrawLogger.error("EmailCaptureEventHandler: No user ID available.");
        return false; // Cannot trigger without User ID
      }
  
      // We no longer need to check isNewCustomer here, as init() already filtered for it.
      GrawLogger.log(`EmailCaptureEventHandler: Attempting to trigger '${this.EVENT_NAME}' event.`);
  
      try {
        // Pass an empty payload - the event name itself signifies the intent for new customers.
        const success = await ConversationStateManager.triggerVoiceflowEvent(
          userId,
          this.EVENT_NAME,
          {} // Empty payload
        );
  
        if (success) {
          GrawLogger.log(`EmailCaptureEventHandler: Event '${this.EVENT_NAME}' triggered successfully via StateManager.`);
          this.messageSent = true; // Mark as sent if triggered
        } else {
          GrawLogger.log(`EmailCaptureEventHandler: Event '${this.EVENT_NAME}' was not triggered by StateManager (likely conversation ongoing or widget open).`);
        }
        return success; // Return the success status from the StateManager
      } catch (error) {
        GrawLogger.error(`EmailCaptureEventHandler: Error triggering event '${this.EVENT_NAME}':`, error);
        return false;
      }
    }
  };
  
  // Initialize the email capture handler when the page is ready
  //document.addEventListener('DOMContentLoaded', function() {
    // Using a slight delay to ensure ConversationStateManager is loaded
  //  setTimeout(() => {
  //    EmailCaptureEventHandler.init();
  //  }, 500);
  //});