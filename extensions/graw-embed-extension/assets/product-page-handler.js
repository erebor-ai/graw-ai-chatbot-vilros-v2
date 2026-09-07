const ProductDataCollector = {
    //Base config
    //_thresholdTime: 15000, //15 seconds
  
    getProductData: function () {
      // Get product data from window.meta or window.shopifyProduct
      const product = window.shopifyProduct;
      if (product && window.shopifyProductMetafields) {
        product.metafields = window.shopifyProductMetafields;
      }
  
      if (!product) {
        GrawLogger.warn(
          "No product data found in either window.meta or window.shopifyProduct"
        );
        return null;
      }
  
      // Get the selected/first variant
      const selectedVariant = this.getSelectedVariant(product);
      const variantData = selectedVariant
        ? window.shopifyVariantData?.[selectedVariant.id]
        : null;
  
      // Get inventory data based on management type
      const getInventoryData = (variantData) => {
        if (!variantData) return { quantity: "Unknown", policy: "Unknown" };
  
        const { inventory_management, inventory_quantity, inventory_policy } =
          variantData;
  
        return {
          quantity:
            inventory_management === "shopify" ? inventory_quantity : "Unknown",
          policy: inventory_policy || "Unknown",
        };
      };
  
      // Function to format weight from grams to kg
      const formatWeight = (weightInGrams) => {
        if (!weightInGrams) return "unknown";
        return `${(weightInGrams / 1000).toFixed(1)}kg`;
      };
  
      const inventoryData = getInventoryData(variantData);
  
      // Format inventory policy for context
      const formatInventoryPolicy = (policy) => {
        switch (policy) {
          case "continue":
            return "This variant continues selling when out of stock, suggesting high restock confidence or made-to-order capability";
          case "deny":
            return "This variant stops selling when out of stock, indicating limited availability or strict inventory control";
          default:
            return "Inventory policy unknown";
        }
      };
  
      // Function to retrieve review data
      const getReviewData = function (product) {
        // Check for Judge.me & Fera (Shopify standard metafields)
        if (
          product.metafields?.reviews?.rating?.value &&
          product.metafields?.reviews?.rating_count
        ) {
          return {
            rating: product.metafields.reviews.rating.value,
            count: product.metafields.reviews.rating_count,
          };
        }
  
        // Check for Loox
        if (
          product.metafields?.loox?.avg_rating &&
          product.metafields?.loox?.num_reviews
        ) {
          return {
            rating: product.metafields.loox.avg_rating,
            count: product.metafields.loox.num_reviews,
          };
        }
  
        // Check for Okendo
        if (product.metafields?.okendo?.summaryData?.reviewAverageValue) {
          return {
            rating: product.metafields.okendo.summaryData.reviewAverageValue,
            count: product.metafields.okendo.summaryData.reviewCount,
          };
        }
  
        // Check for Tydal
        if (product.metafields?.ba_rev?.review_data?.stars) {
          return {
            rating: product.metafields.ba_rev.review_data.stars,
            count: product.metafields.ba_rev.review_data.reviews_count,
          };
        }
  
        // Check for Air Reviews
        if (product.metafields?.air_reviews_product?.review_avg) {
          return {
            rating: product.metafields.air_reviews_product.review_avg,
            count: product.metafields.air_reviews_product.review_count,
          };
        }
  
        // No review data found
        return {
          rating: "null",
          count: "null",
        };
      };
  
      const productData = {
        // Basic product info
        title: product.title,
        description: this.stripHtmlTags(product.description),
        vendor: product.vendor,
        type: product.type,
        tags: product.tags,
  
        // Price information
        price: this.formatPrice(selectedVariant?.price || product.price),
        compareAtPrice: this.formatPrice(
          selectedVariant?.compare_at_price || product.compare_at_price
        ),
        onSale: selectedVariant?.compare_at_price > selectedVariant?.price,
  
        // Variant info
        variantTitle: selectedVariant?.title || null,
        variantId: selectedVariant?.id || null,
        productWeight: formatWeight(selectedVariant?.weight || product.weight),
  
        // Inventory data
        inventoryQuantity: inventoryData.quantity,
        inventoryPolicy: inventoryData.policy,
        inventoryContext: formatInventoryPolicy(inventoryData.policy),
        inStock:
          inventoryData.quantity !== "Unknown"
            ? inventoryData.quantity > 0
            : selectedVariant?.available,
  
        // URLs and media
        url: window.location.href,
  
        // Collections/categories
        collections: product.collections,
  
        // Variants info
        hasVariants: product.variants?.length > 1,
  
        // Metadata
        createdAt: product.created_at,
        publishedAt: product.published_at,
  
        // Reviews
        reviewCount: getReviewData(product).count,
        rating: getReviewData(product).rating,
      };
  
      return productData;
    },
  
    getSelectedVariant: function (product) {
      // Try to get currently selected variant from URL or selected option
      const urlParams = new URLSearchParams(window.location.search);
      const variantId = urlParams.get("variant") || urlParams.get("variant_id");
  
      // Handle different ID formats (some themes use different formats)
      const possibleIds = [
        parseInt(variantId),
        `gid://shopify/ProductVariant/${variantId}`,
        String(variantId),
      ];
  
      if (variantId && product.variants) {
        const variant = product.variants.find(
          (v) =>
            possibleIds.includes(v.id) || possibleIds.includes(v.id.toString())
        );
        if (variant) return variant;
      }
  
      // If no variant in URL, try to find selected variant based on current option selections
      if (product.variants && product.options_with_values) {
        const selectedOptions = {};
        product.options_with_values.forEach((option) => {
          // Check for various selector patterns used across different themes
          const selectors = [
            `select[data-option="${option.name}"]`,
            `select[name="options[${option.name}]"]`,
            `input[type="radio"][name="${option.name}"]:checked`,
            `input[type="radio"][name="options[${option.name}]"]:checked`,
            `[data-option-value][aria-checked="true"]`,
            `[data-value="${option.name}"].selected`,
          ];
  
          const element = selectors.reduce(
            (found, selector) => found || document.querySelector(selector),
            null
          );
  
          if (element) {
            selectedOptions[option.name] =
              element.value || element.getAttribute("data-value");
          }
        });
  
        // Find variant that matches all selected options
        return product.variants.find((variant) =>
          variant.options.every(
            (option, index) => option === selectedOptions[product.options[index]]
          )
        );
      }
  
      // Return first variant or null as fallback
      return product.variants?.[0] || null;
    },
  
    formatPrice: function (cents) {
      if (!cents) return null;
  
      return (cents / 100).toLocaleString("en-US", {
        style: "currency",
        currency: window.Shopify?.currency?.active || "USD",
      });
    },
  
    stripHtmlTags: function (str) {
      if (!str) return "";
      return str.replace(/<[^>]*>/g, "");
    },
  };
  
  const ProductPageEventHandler = {
    timer: null,
    currentProductData: null,
    lastVariantId: null,
    _thresholdTime: 15000, // Default fallback in milliseconds (15s)

    init: function () {
      GrawLogger.log("GRAW AI (ProductPageEventHandler): Initializing...");
      // Access the globally defined settings when this handler is initialized
      if (window.GRAW_AI_SETTINGS && typeof window.GRAW_AI_SETTINGS.productPageThresholdTime === 'number') {
          // window.GRAW_AI_SETTINGS.productPageThresholdTime is already in milliseconds
          this._thresholdTime = window.GRAW_AI_SETTINGS.productPageThresholdTime;
          GrawLogger.log('GRAW AI (ProductPageEventHandler): productPageThresholdTime set from settings to:', this._thresholdTime + 'ms');
      } else {
          GrawLogger.warn('GRAW AI (ProductPageEventHandler): productPageThresholdTime setting not found or invalid, using default:', this._thresholdTime + 'ms');
      }     

      if (this.isProductPage()) {
        this.setupVariantChangeListeners();
        const productData = ProductDataCollector.getProductData();
        if (productData) {
          this.startProductPageTimer(productData);
        } else {
          GrawLogger.warn("GRAW AI (ProductPageEventHandler): No product data available on init for product page.");
        }
      } else {
        // GrawLogger.log("GRAW AI (ProductPageEventHandler): Not on a product page during init.");
      }
    },
  
    setupVariantChangeListeners: function () {
      // Common variant change events across different themes
      const variantEvents = [
        "variant:change", // Dawn and derivatives
        "variantChange", // Spotlight and others
        "variant-change", // Some older themes
        "product:variant:change", // Empire and derivatives
        "product-variant-change", // Venture and others
        "variant_changed", // Brooklyn and derivatives
        "variant_changed", // Duplicate removed
        "change.variant", // Additional common event
        "productVariantChange", // Additional common event
      ];
  
      // Listen for all common variant change events
      variantEvents.forEach((eventName) => {
        document.addEventListener(eventName, () => {
          clearTimeout(this.timer);
          const updatedProductData = ProductDataCollector.getProductData();
          if (updatedProductData) {
            this.startProductPageTimer(updatedProductData);
          }
        });
      });
  
      // Listen for variant selection changes on form elements
      const variantSelectors = document.querySelectorAll(
        'select[data-option], input[type="radio"][data-option], [data-option-value], .single-option-selector'
      );
      variantSelectors.forEach((selector) => {
        selector.addEventListener("change", () => {
          clearTimeout(this.timer);
          const updatedProductData = ProductDataCollector.getProductData();
          if (updatedProductData) {
            this.startProductPageTimer(updatedProductData);
          }
        });
      });
  
      // Listen for variant URL changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" || mutation.type === "attributes") {
            const urlParams = new URLSearchParams(window.location.search);
            const newVariantId = urlParams.get("variant");
  
            if (newVariantId && newVariantId !== this.lastVariantId) {
              this.lastVariantId = newVariantId;
              clearTimeout(this.timer);
              const updatedProductData = ProductDataCollector.getProductData();
              if (updatedProductData) {
                this.startProductPageTimer(updatedProductData);
              }
            }
          }
        });
      });
  
      // Observe URL and content changes
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["href", "data-variant-id"],
      });
    },
  
    isProductPage: function () {
      const isProduct =
        window.meta?.page?.pageType === "product" ||
        window.location.pathname.includes("/products/");
      return isProduct;
    },
  
    startProductPageTimer: function (productData) {
      this.currentProductData = productData;
      clearTimeout(this.timer);
  
      GrawLogger.log('GRAW AI (ProductPageEventHandler): Starting product page timer with delay:', this._thresholdTime + 'ms');
      // Use the thresholdTime from THIS object instance
      this.timer = setTimeout(() => {
        this.triggerProductPageEvent();
      }, this._thresholdTime); // CHANGED: Use this._thresholdTime
    },
  
    triggerProductPageEvent: function () {
      if (!this.currentProductData) {
        GrawLogger.error("GRAW AI (ProductPageEventHandler): No product data available when triggering event");
        return;
      }
    
      if (!this.currentProductData.inStock) {
        GrawLogger.log("GRAW AI (ProductPageEventHandler): Product is out of stock, not triggering userStayedProductPage event");
        return;
      }
    
      const userId = (typeof UserIdentifier !== 'undefined' && UserIdentifier.getUserId) ? UserIdentifier.getUserId() : null;
      if (!userId) {
        GrawLogger.error("GRAW AI (ProductPageEventHandler): No user ID available");
        return;
      }
    
      if (typeof ConversationStateManager !== 'undefined' && ConversationStateManager.triggerVoiceflowEvent) {
        ConversationStateManager.triggerVoiceflowEvent(
          userId, 
          "userStayedProductPage", 
          { productData: JSON.stringify(this.currentProductData) }
        ).catch(error => GrawLogger.error("GRAW AI (ProductPageEventHandler): Error triggering VF event:", error));
      } else {
        GrawLogger.error("GRAW AI (ProductPageEventHandler): ConversationStateManager not available.");
      }
    }
  };
  