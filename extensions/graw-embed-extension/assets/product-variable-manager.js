const ProductVariableManager = {
    // Track current page type to handle transitions
    currentPageType: null,
    debounceTimer: null,
    observer: null,
    maxRetries: 3,
    apiEndpoint: "/apps/voiceflow",
    chatResetObserver: null,
  
    loading: false, // Add a loading state
    init: function () {
        try {
            GrawLogger.log("ProductVariableManager initialized successfully");
            // Set initial page type
            this.currentPageType = this.isProductPage() ? "product" : "other";
            // Set up page change detection
            this.setupPageChangeDetection();
            // Set up chat reset detection
            this.setupChatResetDetection();
            // If on product page, immediately update variables
            if (this.isProductPage()) {
                this.handleProductPageEntry();
            }
            // Clean up when the page unloads
            window.addEventListener("beforeunload", () => this.cleanup());
        } catch (error) {
            GrawLogger.error("Error initializing ProductVariableManager:", error);
            // Consider displaying an error message to the user
        }
    },
  
    cleanup: function () {
      try {
        // Disconnect observers to prevent memory leaks
        if (this.observer) {
          this.observer.disconnect();
        }
        
        if (this.chatResetObserver) {
          this.chatResetObserver.disconnect();
        }
  
        // Clear any pending timers
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
  
        // Handle product page exit if necessary
        if (this.currentPageType === "product") {
          this.handleProductPageExit();
        }
      } catch (error) {
        GrawLogger.error("Error during ProductVariableManager cleanup:", error);
      }
    },
  
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
  
    setupPageChangeDetection: function () {
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
        history.pushState = function () {
          originalPushState.apply(this, arguments);
          window.dispatchEvent(new Event("pushstate"));
        };
        window.addEventListener("pushstate", () => this.handlePageChange());
  
        const originalReplaceState = history.replaceState;
        history.replaceState = function () {
          originalReplaceState.apply(this, arguments);
          window.dispatchEvent(new Event("replacestate"));
        };
        window.addEventListener("replacestate", () => this.handlePageChange());
      } catch (error) {
        GrawLogger.error("Error setting up page change detection:", error);
      }
    },
  
    setupChatResetDetection: function() {
      try {
        // Set up a mutation observer to detect when the chat reset button appears in the DOM
        this.chatResetObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              // Check added nodes for our target button container
              mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  // Look for the prompt div containing the reset buttons
                  const promptDiv = node.classList && node.classList.contains('vfrc-prompt') ? 
                    node : node.querySelector('.vfrc-prompt');
                  
                  if (promptDiv) {
                    // Find the "Start new chat" button
                    const startNewChatButton = Array.from(promptDiv.querySelectorAll('button')).find(
                      button => button.textContent.trim() === 'Start new chat'
                    );
                    
                    if (startNewChatButton) {
                      GrawLogger.log('Found "Start new chat" button, adding listener');
                      
                      // Add click event listener
                      startNewChatButton.addEventListener('click', this.handleChatReset.bind(this));
                    }
                  }
                }
              });
            }
          }
        });
        
        // Start observing the entire document for any changes
        this.chatResetObserver.observe(document.body, { 
          childList: true, 
          subtree: true 
        });
        
        // Also check if the button already exists on the page
        this.checkForExistingResetButton();
        
      } catch (error) {
        GrawLogger.error("Error setting up chat reset detection:", error);
      }
    },
    
    checkForExistingResetButton: function() {
      // Check if the reset button already exists on the page
      const existingButtons = document.querySelectorAll('.vfrc-prompt button');
      existingButtons.forEach(button => {
        if (button.textContent.trim() === 'Start new chat') {
          GrawLogger.log('Found existing "Start new chat" button, adding listener');
          button.addEventListener('click', this.handleChatReset.bind(this));
        }
      });
    },
    
    handleChatReset: function() {
      GrawLogger.log('Chat reset button clicked');
      
      // Check if user is on a product page
      if (this.isProductPage()) {
        GrawLogger.log('User is on product page, updating Voiceflow variables after chat reset');
        
        // Get the current product data and re-send it to ensure it's available in the new conversation
        const viewedProductData = ProductDataCollector.getProductData();
        const userId = UserIdentifier.getUserId();
        
        if (viewedProductData && userId) {
          // Use a small delay to ensure the Voiceflow state has been reset first
          setTimeout(() => {
            GrawLogger.log('Re-sending product data after chat reset');
            this.updateVoiceflowVariables(userId, viewedProductData, true);
          }, 500);
        } else {
          GrawLogger.error('Missing product data or user ID during chat reset');
        }
      } else {
        GrawLogger.log('User is not on a product page, no need to update variables');
      }
    },
  
    handlePageChange: function () {
        try {
            // Prevent race conditions by clearing any pending operations
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
    
            const isProductPage = this.isProductPage();
            const wasProductPage = this.currentPageType === "product";
    
            // If leaving a product page, handle it immediately
            if (wasProductPage && !isProductPage) {
                GrawLogger.log("Detected exit from product page");
                // Call exit handler right away - don't wait for DOMContentLoaded
                this.handleProductPageExit();
            }
    
            // Update the page type after handling the exit
            this.currentPageType = isProductPage ? "product" : "other";
            
            // If entering a product page or moving between product pages
            if (isProductPage) {
                // Add a small delay to ensure product data is loaded
                setTimeout(() => this.handleProductPageEntry(), 300);
            }
        } catch (error) {
            GrawLogger.error("Error handling page change:", error);
        }
    },
  
    handleProductPageEntry: function (retryCount = 0) {
      try {
        GrawLogger.log("handleProductPageEntry called");
        this.loading = true; // Set loading state
        // Get product data
        const viewedProductData = ProductDataCollector.getProductData();
        GrawLogger.log(viewedProductData);
        if (!viewedProductData) {
          if (retryCount < this.maxRetries) {
            GrawLogger.warn(
              `No product data available, will retry (${retryCount + 1}/${
                this.maxRetries
              })...`
            );
            // Retry with increasing delay
            setTimeout(
              () => this.handleProductPageEntry(retryCount + 1),
              500 * (retryCount + 1)
            );
          } else {
            GrawLogger.error("Failed to get product data after multiple attempts");
            this.loading = false; // Reset loading state
            // Consider displaying an error message to the user
          }
          return;
        }
        GrawLogger.log("Product data retrieved:", viewedProductData);
        // Get user ID
        const userId = UserIdentifier.getUserId();
        if (!userId) {
          GrawLogger.error("No user ID available");
          this.loading = false; // Reset loading state
          return;
        }
        GrawLogger.log("User ID retrieved:", userId);
        // Send data to backend
        this.updateVoiceflowVariables(userId, viewedProductData, true);
      } catch (error) {
        GrawLogger.error("Error in handleProductPageEntry:", error);
        this.loading = false; // Reset loading state
        // Consider displaying an error message to the user
      }
    },
  
    handleProductPageExit: function () {
        try {
            GrawLogger.log("handleProductPageExit called");
            const userId = UserIdentifier.getUserId();
            if (!userId) {
                GrawLogger.error("No user ID available for product page exit");
                return;
            }
    
            // Get the store's domain
            const shopDomain = window.Shopify?.shop || window.location.hostname;
            
            // Prepare the data for the beacon
            const data = {
                userId: userId,
                viewedProductData: null,
                customerOnProductPage: false,
                shopDomain: shopDomain,
            };
    
            // Try to use sendBeacon for more reliable delivery during page transitions
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                const success = navigator.sendBeacon(this.apiEndpoint, blob);
                GrawLogger.log("sendBeacon attempt result:", success);
                
                // If sendBeacon fails or isn't available, fall back to the regular fetch
                if (!success) {
                    this.updateVoiceflowVariables(userId, null, false);
                }
            } else {
                // Fall back to regular XHR/fetch
                this.updateVoiceflowVariables(userId, null, false);
            }
        } catch (error) {
            GrawLogger.error("Error in handleProductPageExit:", error);
        }
    },
    
    updateVoiceflowVariables: function (userId, viewedProductData, onProductPage, retryCount = 0) {
      // Debounce function to prevent too many calls
      if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
          GrawLogger.log("updateVoiceflowVariables called");
          // Get the store's domain
          const shopDomain = window.Shopify?.shop || window.location.hostname;
          // Prepare the data to be sent to the backend
          const data = {
              userId: userId,
              viewedProductData: viewedProductData ? JSON.stringify(viewedProductData) : null,
              customerOnProductPage: onProductPage,
              shopDomain: shopDomain,
          };
          GrawLogger.log("Sending data to backend:", data);
          // Send the data to your Shopify app's API endpoint
          fetch(this.apiEndpoint, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
              // Include credentials to ensure cookies are sent with the request
              credentials: "include"
          })
              .then((response) => {
                  if (!response.ok) {
                      throw new Error(`Server error: ${response.status}`);
                  }
                  return response; // Return the response object
              })
              .then((response) => {
                  GrawLogger.log("Voiceflow variables updated successfully");
                  this.loading = false; // Reset loading state
              })
              .catch((error) => {
                  GrawLogger.error("Error updating Voiceflow variables:", error);
                  this.loading = false;
                  // Check for network errors
                  const isNetworkError = error.message.includes('NetworkError') ||
                      error.message.includes('Failed to fetch');
                  // Implement retry logic for transient errors
                  if (retryCount < this.maxRetries && (isNetworkError || error.message.includes('500') || error.message.includes('timeout'))) {
                      GrawLogger.log(`Retrying (${retryCount + 1}/${this.maxRetries})...`);
                      setTimeout(() => {
                          this.updateVoiceflowVariables(userId, viewedProductData, onProductPage, retryCount + 1);
                      }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
                  }
              });
      }, 250);
    },
  };