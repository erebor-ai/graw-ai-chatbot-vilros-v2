// OutOfStockHandler.js - Triggers event when customer views out-of-stock products
const OutOfStockHandler = {
    // Flag to track if we've triggered the event for the current product page visit
    eventTriggeredForCurrentVisit: false,
    observer: null,
    maxRetries: 3,
  
    predefinedPopups: {
      popupMessageExamples: [
        {
          hookMessage: "Oh no! 😕 The {productTitle} is playing hard to get. We've found some perfect alternatives that might make you forget your first choice.",
          ctaMessage: "Click the chat bubble to browse your options 👇"
        },
        {
          hookMessage: "Looks like everyone loved the {productTitle} as much as you do! But we've got some brilliant alternatives waiting in the wings.",
          ctaMessage: "Click the chat for some handpicked alternatives 👇"
        },
        {
          hookMessage: "That {productTitle} is temporarily sold out — it's pretty popular! Want to see what other savvy shoppers are choosing instead?",
          ctaMessage: "Click the chat for smart alternatives 🧠"
        },
        {
          hookMessage: "We're restocking the {productTitle} soon, but why wait? We've found some alternatives that might be even better for you.",
          ctaMessage: "Click below to explore options tailored just for you 👀"
        },
        {
          hookMessage: "Missed it by a whisker! The {productTitle} is out of stock, but we've curated some impressive alternatives just for you.",
          ctaMessage: "Click the chat to see what we've found 👀"
        },
        {
          hookMessage: "Looks like the {productTitle} is currently unavailable. While it's away, let us show you some other stars of the show.",
          ctaMessage: "Click the chat bubble to browse your options 👇"
        }
      ]
    },  
    
    init: function() {
      try {
        GrawLogger.log("OutOfStockHandler initialized");
        
        // Set up initial check if on product page
        if (this.isProductPage()) {
          this.checkProductStock();
        }
        
        // Set up page change detection for SPA navigation
        this.setupPageChangeDetection();
        
        // Set up variant change detection
        if (this.isProductPage()) {
          this.setupVariantChangeListeners();
        }
        
        // Clean up when page unloads
        window.addEventListener("beforeunload", () => this.cleanup());
      } catch (error) {
        GrawLogger.error("Error initializing OutOfStockHandler:", error);
      }
    },
    
    cleanup: function() {
      try {
        // Disconnect observer to prevent memory leaks
        if (this.observer) {
          this.observer.disconnect();
        }
      } catch (error) {
        GrawLogger.error("Error during OutOfStockHandler cleanup:", error);
      }
    },
    
    isProductPage: function() {
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
    
    setupPageChangeDetection: function() {
      try {
        // Listen for URL changes (for SPA-like themes)
        let lastUrl = location.href;
        
        // Create observer to watch for URL changes
        this.observer = new MutationObserver(() => {
          if (lastUrl !== location.href) {
            lastUrl = location.href;
            this.handlePageChange();
          }
        });
        
        // Observe the whole document with minimal changes tracked for performance
        this.observer.observe(document, { subtree: true, childList: true });
        
        // Also handle traditional page navigation events
        window.addEventListener("popstate", () => this.handlePageChange());
        
        // Handle history API modifications (for SPA navigation)
        const originalPushState = history.pushState;
        history.pushState = function() {
          originalPushState.apply(this, arguments);
          window.dispatchEvent(new Event("pushstate"));
        };
        window.addEventListener("pushstate", () => this.handlePageChange());
        
        const originalReplaceState = history.replaceState;
        history.replaceState = function() {
          originalReplaceState.apply(this, arguments);
          window.dispatchEvent(new Event("replacestate"));
        };
        window.addEventListener("replacestate", () => this.handlePageChange());
      } catch (error) {
        GrawLogger.error("Error setting up page change detection:", error);
      }
    },
    
    handlePageChange: function() {
      try {
        const isCurrentlyOnProductPage = this.isProductPage();
        
        // Reset the event triggered flag when leaving a product page
        if (!isCurrentlyOnProductPage) {
          this.eventTriggeredForCurrentVisit = false;
          GrawLogger.log("Left product page, resetting event trigger flag");
        }
        
        // Check if entering a product page
        if (isCurrentlyOnProductPage) {
          // Reset the event triggered flag when entering a new product page
          this.eventTriggeredForCurrentVisit = false;
          GrawLogger.log("Entered new product page, resetting event trigger flag");
          
          // Add a small delay to ensure product data is loaded
          setTimeout(() => this.checkProductStock(), 300);
          
          // Set up variant change listeners for the new page
          this.setupVariantChangeListeners();
        }
      } catch (error) {
        GrawLogger.error("Error handling page change:", error);
      }
    },
    
    setupVariantChangeListeners: function() {
      try {
        // Common variant change events across different themes
        const variantEvents = [
          "variant:change",      // Dawn and derivatives
          "variantChange",       // Spotlight and others
          "variant-change",      // Some older themes
          "product:variant:change", // Empire and derivatives
          "product-variant-change", // Venture and others
          "variant_changed",     // Brooklyn and derivatives
          "change.variant",      // Additional common event
          "productVariantChange" // Additional common event
        ];
        
        // Listen for all common variant change events
        variantEvents.forEach(eventName => {
          document.addEventListener(eventName, () => {
            this.checkProductStock(true);
          });
        });
        
        // Listen for variant selection changes on form elements
        const variantSelectors = document.querySelectorAll(
          'select[data-option], input[type="radio"][data-option], [data-option-value], .single-option-selector'
        );
        variantSelectors.forEach(selector => {
          selector.addEventListener("change", () => {
            this.checkProductStock(true);
          });
        });
        
        // Listen for variant URL changes
        const urlObserver = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (mutation.type === "childList" || mutation.type === "attributes") {
              const urlParams = new URLSearchParams(window.location.search);
              const variantId = urlParams.get("variant");
              
              if (variantId && variantId !== this.lastVariantId) {
                this.lastVariantId = variantId;
                this.checkProductStock(true);
              }
            }
          });
        });
        
        // Observe URL and content changes
        urlObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["href", "data-variant-id"]
        });
      } catch (error) {
        GrawLogger.error("Error setting up variant change listeners:", error);
      }
    },
  
    displayPredefinedOutOfStockPopup: function(productData) {
      try {
        GrawLogger.log("Attempting to display predefined OOS popup");
  
        const examples = this.predefinedPopups.popupMessageExamples;
        if (!examples || examples.length === 0) {
          GrawLogger.warn("No predefined pop-up messages found.");
          return;
        }
  
        // Select a random set of messages
        const randomIndex = Math.floor(Math.random() * examples.length);
        const selectedMessages = examples[randomIndex];
  
        // Determine product title for dynamic insertion
        const productTitle = productData.variantTitle === 'Default Title' || !productData.variantTitle
          ? productData.title
          : `${productData.title} - ${productData.variantTitle}`;
  
        // Prepare messages with dynamic product title
        const messagesToPush = [
          {
            message: selectedMessages.hookMessage.replace("{productTitle}", productTitle),
            delay: 2000 // Standard delay for the first message
          },
          {
            message: selectedMessages.ctaMessage.replace("{productTitle}", productTitle), // In case cta also uses it
            delay: 3000 // Standard delay for the second message
          }
        ];
  
        // Clear any existing proactive messages and push new ones
        window.voiceflow.chat.proactive.clear();
  
        let currentDelay = 0;
        messagesToPush.forEach((messageObj, index) => {
          // The example code you provided accumulates delays,
          // but for two messages with fixed delays, direct setTimeout is simpler.
          // However, to match the structure if you expand it:
          currentDelay = messageObj.delay === 0 ? 0 : currentDelay + messageObj.delay; // First message at 0, next accumulates from *its own delay*
  
          setTimeout(() => {
            try {
              window.voiceflow.chat.proactive.push({
                type: "text",
                payload: {
                  message: messageObj.message
                  // style: messageObj.style || {}, // If you add styles
                },
              });
              GrawLogger.log("Pushed predefined proactive message:", messageObj.message);
            } catch (pushError) {
              GrawLogger.error("Failed to push predefined proactive message:", pushError);
            }
          }, currentDelay);
        });
  
      } catch (error) {
        GrawLogger.error("Error in displayPredefinedOutOfStockPopup:", error);
      }
    },
    
    checkProductStock: async function(isVariantChange = false, retryCount = 0) { // Mark as async
      try {
        GrawLogger.log("OutOfStockHandler: Checking product stock");
  
        if (this.eventTriggeredForCurrentVisit && !isVariantChange) { // Allow re-trigger on variant change
          GrawLogger.log("OOS event/popup already handled for this product page visit, skipping check unless variant changed.");
          return;
        }
  
        const productData = ProductDataCollector.getProductData();
  
        if (!productData) {
          if (retryCount < this.maxRetries) {
            GrawLogger.warn(`No product data available, will retry (${retryCount + 1}/${this.maxRetries})...`);
            setTimeout(() => this.checkProductStock(isVariantChange, retryCount + 1), 500 * (retryCount + 1));
          } else {
            GrawLogger.error("Failed to get product data after multiple attempts for OOS check.");
          }
          return;
        }
  
        // If it's just a variant change on the same product page, and a previous variant was OOS,
        // we might have already shown a popup. Reset if this new variant IS in stock.
        if (isVariantChange && productData.inStock) {
            this.eventTriggeredForCurrentVisit = false; // Allow popup if it becomes OOS again
            GrawLogger.log("Variant changed to in-stock, resetting OOS trigger flag for this page.");
            return; // Don't proceed if the new variant is in stock
        }
  
  
        if (!productData.inStock) {
          GrawLogger.log("Product out of stock:", productData.title, productData.variantTitle);
  
          if (this.eventTriggeredForCurrentVisit) {
              GrawLogger.log("OOS popup/event already shown for a variant on this product page visit.");
              return;
          }
  
          // --- Core Logic Change ---
          const userId = UserIdentifier.getUserId();
          if (!userId) {
            GrawLogger.error("No user ID, cannot proceed with OOS handling.");
            return;
          }
  
          // 1. Check conversation state ONCE
          // The eventName "productOutOfStock" is passed to ensure backend clears relevant state
          // if it's the first interaction for this specific event context.
          const { isConversationOngoing, fallbackUsed } = await ConversationStateManager.checkConversationState(userId, "productOutOfStock");
          const isWidgetOpen = ConversationStateManager.isWidgetOpen();
  
          let canProceed = !isConversationOngoing && !isWidgetOpen;
          if (fallbackUsed && !isConversationOngoing) { // If API failed but fallback says not ongoing
              GrawLogger.log("checkConversationState used fallback, proceeding as if not ongoing.");
              // canProceed is already true if isConversationOngoing is false
          }
  
          if (canProceed) {
            const samplingRate = window.GRAW_AI_SETTINGS?.eventSamplingRate ?? 1.0;
            if (Math.random() > samplingRate) {
              GrawLogger.log(`GRAW Event Sampling: Skipping OOS popup and event (rate: ${samplingRate}).`);
              this.eventTriggeredForCurrentVisit = true; // still mark so we don't re-roll on every scroll/mutation for this visit
              return;
            }

            GrawLogger.log("Safe to display pop-up and trigger Voiceflow event.");
            this.displayPredefinedOutOfStockPopup(productData);
            this.triggerVoiceflowBackgroundEvent(userId, productData);
            this.eventTriggeredForCurrentVisit = true;
          } else {
            GrawLogger.log("Skipping OOS proactive messages and event trigger due to ongoing conversation or open widget.");
          }
          // --- End Core Logic Change ---
  
        } else {
          GrawLogger.log("Product in stock:", productData.title, productData.variantTitle);
          // If we were previously on an OOS variant on this page, and now it's in stock, reset.
          if (this.eventTriggeredForCurrentVisit) {
              this.eventTriggeredForCurrentVisit = false;
              GrawLogger.log("Product now in stock, resetting OOS trigger flag for this page visit.");
          }
        }
      } catch (error) {
        GrawLogger.error("Error checking product stock:", error);
      }
    },
    
    triggerVoiceflowBackgroundEvent: function(userId, productData) {
      try {
        GrawLogger.log("Triggering out of stock event for Voiceflow.");
  
        // Prepare payload for the Voiceflow event (for alternatives & long messages)
        const payload = {
          productData: JSON.stringify({
            title: productData.title,
            variantTitle: productData.variantTitle,
            description: productData.description,
            url: productData.url,
            price: parseFloat(productData.price?.replace(/[^0-9.-]+/g,"")) || 0, // Ensure numerical
            vendor: productData.vendor,
            type: productData.type,
            tags: productData.tags,
            collections: productData.collections, // Ensure collections is passed
            rating: productData.rating // Pass rating
          })
        };
  
        // The triggerVoiceflowEvent in ConversationStateManager already handles
        // checking if it's safe to trigger based on conversation state and widget status.
        // It passes eventName, which is good.
        ConversationStateManager.triggerVoiceflowEvent(
          userId,
          "productOutOfStock",
          payload
        ).then(success => {
          if (success) {
            GrawLogger.log("Successfully triggered 'productOutOfStock' background event.");
          } else {
            GrawLogger.warn("Failed to trigger 'productOutOfStock' background event (likely due to active convo/widget).");
          }
        }).catch(error => {
          GrawLogger.error("Error triggering 'productOutOfStock' background event:", error);
        });
  
      } catch (error) {
        GrawLogger.error("Error in triggerVoiceflowBackgroundEvent:", error);
      }
    }
  };