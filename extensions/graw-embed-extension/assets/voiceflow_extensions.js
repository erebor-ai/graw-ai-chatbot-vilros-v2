const SVG_Thumb = `<svg width="20px" height="20px" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29398 20.4966C4.56534 20.4966 4 19.8827 4 19.1539V12.3847C4 11.6559 4.56534 11.042 5.29398 11.042H8.12364L10.8534 4.92738C10.9558 4.69809 11.1677 4.54023 11.4114 4.50434L11.5175 4.49658C12.3273 4.49658 13.0978 4.85402 13.6571 5.48039C14.2015 6.09009 14.5034 6.90649 14.5034 7.7535L14.5027 8.92295L18.1434 8.92346C18.6445 8.92346 19.1173 9.13931 19.4618 9.51188L19.5612 9.62829C19.8955 10.0523 20.0479 10.6054 19.9868 11.1531L19.1398 18.742C19.0297 19.7286 18.2529 20.4966 17.2964 20.4966H8.69422H5.29398ZM11.9545 6.02658L9.41727 11.7111L9.42149 11.7693L9.42091 19.042H17.2964C17.4587 19.042 17.6222 18.8982 17.6784 18.6701L17.6942 18.5807L18.5412 10.9918C18.5604 10.8194 18.5134 10.6486 18.4189 10.5287C18.3398 10.4284 18.2401 10.378 18.1434 10.378H13.7761C13.3745 10.378 13.0488 10.0524 13.0488 9.65073V7.7535C13.0488 7.2587 12.8749 6.78825 12.5721 6.44915C12.4281 6.28794 12.2615 6.16343 12.0824 6.07923L11.9545 6.02658ZM7.96636 12.4966H5.45455V19.042H7.96636V12.4966Z" fill="white"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29398 20.4966C4.56534 20.4966 4 19.8827 4 19.1539V12.3847C4 11.6559 4.56534 11.042 5.29398 11.042H8.12364L10.8534 4.92738C10.9558 4.69809 11.1677 4.54023 11.4114 4.50434L11.5175 4.49658C12.3273 4.49658 13.0978 4.85402 13.6571 5.48039C14.2015 6.09009 14.5034 6.90649 14.5034 7.7535L14.5027 8.92295L18.1434 8.92346C18.6445 8.92346 19.1173 9.13931 19.4618 9.51188L19.5612 9.62829C19.8955 10.0523 20.0479 10.6054 19.9868 11.1531L19.1398 18.742C19.0297 19.7286 18.2529 20.4966 17.2964 20.4966H8.69422H5.29398ZM11.9545 6.02658L9.41727 11.7111L9.42149 11.7693L9.42091 19.042H17.2964C17.4587 19.042 17.6222 18.8982 17.6784 18.6701L17.6942 18.5807L18.5412 10.9918C18.5604 10.8194 18.5134 10.6486 18.4189 10.5287C18.3398 10.4284 18.2401 10.378 18.1434 10.378H13.7761C13.3745 10.378 13.0488 10.0524 13.0488 9.65073V7.7535C13.0488 7.2587 12.8749 6.78825 12.5721 6.44915C12.4281 6.28794 12.2615 6.16343 12.0824 6.07923L11.9545 6.02658ZM7.96636 12.4966H5.45455V19.042H7.96636V12.4966Z" fill="currentColor"></path></svg>`;
// --- NEW: Define separate SVGs for Up and Down ---
const SVG_ThumbUp = `<svg style="width: 17px; height: 17px;" id="Glyph" version="1.1" viewBox="0 0 32 32" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M29.845,17.099l-2.489,8.725C26.989,27.105,25.804,28,24.473,28H11c-0.553,0-1-0.448-1-1V13 c0-0.215,0.069-0.425,0.198-0.597l5.392-7.24C16.188,4.414,17.05,4,17.974,4C19.643,4,21,5.357,21,7.026V12h5.002 c1.265,0,2.427,0.579,3.188,1.589C29.954,14.601,30.192,15.88,29.845,17.099z" id="XMLID_254_"></path><path d="M7,12H3c-0.553,0-1,0.448-1,1v14c0,0.552,0.447,1,1,1h4c0.553,0,1-0.448,1-1V13C8,12.448,7.553,12,7,12z M5,25.5c-0.828,0-1.5-0.672-1.5-1.5c0-0.828,0.672-1.5,1.5-1.5c0.828,0,1.5,0.672,1.5,1.5C6.5,24.828,5.828,25.5,5,25.5z" id="XMLID_256_"></path></svg>`;
const SVG_ThumbDown = `<svg style="width: 17px; height: 17px;" id="Glyph" version="1.1" viewBox="0 0 32 32" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M2.156,14.901l2.489-8.725C5.012,4.895,6.197,4,7.528,4h13.473C21.554,4,22,4.448,22,5v14 c0,0.215-0.068,0.425-0.197,0.597l-5.392,7.24C15.813,27.586,14.951,28,14.027,28c-1.669,0-3.026-1.357-3.026-3.026V20H5.999 c-1.265,0-2.427-0.579-3.188-1.589C2.047,17.399,1.809,16.12,2.156,14.901z" id="XMLID_259_"></path><path d="M25.001,20h4C29.554,20,30,19.552,30,19V5c0-0.552-0.446-1-0.999-1h-4c-0.553,0-1,0.448-1,1v14 C24.001,19.552,24.448,20,25.001,20z M27.001,6.5c0.828,0,1.5,0.672,1.5,1.5c0,0.828-0.672,1.5-1.5,1.5c-0.828,0-1.5-0.672-1.5-1.5 C25.501,7.172,26.173,6.5,27.001,6.5z" id="XMLID_260_"></path></svg>`;

window.vf_done = false;

// --- NEW: Global observer setup ---
let observer = null;
let chatDialog = null;

// function getLiveVoiceflowShade5() {
//   let vfShade5 = null;
//   try {
//       const vfHost = document.querySelector("#voiceflow-chat");
//       let themeSourceElement = null;

//       if (vfHost) {
//           // Check host directly, then common inner elements if host doesn't have it.
//           // Voiceflow might apply it to different elements, so check a few likely candidates.
//           const potentialTargets = [
//               vfHost, // The host itself
//               vfHost.shadowRoot ? vfHost.shadowRoot.querySelector('._1xyscpy0') : null, // Inner content area
//               vfHost.shadowRoot ? vfHost.shadowRoot.querySelector('.vfrc-widget') : null // Widget container within shadow
//           ].filter(Boolean); // Remove nulls

//           for (const el of potentialTargets) {
//               const style = getComputedStyle(el).getPropertyValue('--_1bof89n5').trim();
//               if (style) {
//                   vfShade5 = style;
//                   break; // Found it
//               }
//           }
//       }
//   } catch (e) {
//       GrawLogger.warn("GRAW AI (Extensions): Error reading Voiceflow's live --_1bof89n5", e);
//   }
//   return vfShade5;
// }

// let activePrimaryColorForExtensions = "#4BBBDE"; // Hardcoded ultimate fallback

// if (window.GRAW_AI_GENERATED_PALETTE && window.GRAW_AI_GENERATED_PALETTE.length > 5) {
//   activePrimaryColorForExtensions = window.GRAW_AI_GENERATED_PALETTE[5]; // Use GRAW AI generated palette
//   GrawLogger.log("GRAW AI (Extensions): Using GRAW AI generated palette shade 5 for extensions.");
// } else {
//   const liveVfShade5 = getLiveVoiceflowShade5();
//   if (liveVfShade5) {
//       activePrimaryColorForExtensions = liveVfShade5; // Use Voiceflow's live theme shade 5
//       GrawLogger.log("GRAW AI (Extensions): Using live Voiceflow palette shade 5 for extensions:", activePrimaryColorForExtensions);
//   } else {
//       GrawLogger.log("GRAW AI (Extensions): Falling back to hardcoded default color for extensions.");
//   }
// }

function getChatDialog() {
  if (chatDialog) return chatDialog;
  const shadowRoot = document.querySelector("#voiceflow-chat")?.shadowRoot;
  chatDialog = shadowRoot?.querySelector(".vfrc-chat--dialog"); // Adjust selector if needed
  return chatDialog;
}

function disablePreviousFeedbackButtons(targetNode) {
    const dialog = getChatDialog();
    if (!dialog) return;

    // Find all feedback containers currently in the chat
    const feedbackContainers = dialog.querySelectorAll('.vfrc-feedback');

    feedbackContainers.forEach(container => {
        // Check if this container visually precedes the new user message
        // (A simple check: is it a previous sibling or descendant of a previous sibling?)
        // More robust check: Ensure the container itself is not a child of the targetNode (the new user message div)
        // and that it hasn't already been disabled/selected
        const systemResponseWrapper = container.closest('.vfrc-system-response'); // Get the parent message container
        if (systemResponseWrapper && systemResponseWrapper.compareDocumentPosition(targetNode) & Node.DOCUMENT_POSITION_FOLLOWING) {
             // This feedback appears *before* the new user message node
             const buttons = container.querySelectorAll('.vfrc-feedback--button');
             buttons.forEach(button => {
                // Only disable if it's not already selected or disabled
                if (!button.classList.contains('selected') && !button.classList.contains('disabled')) {
                    button.classList.add('disabled');
                    // Optional: Remove the click listener to be extra safe, though CSS pointer-events: none should suffice
                    // button.removeEventListener('click', handleFeedbackClick); // This requires naming the listener function
                }
             });
        }
    });
}

function setupChatObserver() {
  const targetNode = getChatDialog();
  if (!targetNode) {
    // GrawLogger.log("Chat dialog not found yet, retrying...");
    // Retry after a short delay if the widget loads asynchronously
    setTimeout(setupChatObserver, 500);
    return;
  }

  // GrawLogger.log("Chat dialog found, setting up observer.");

  const config = { childList: true, subtree: false }; // Observe direct children additions

  const callback = (mutationsList, obs) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          // Check if the added node is an element and represents a user response
          if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('vfrc-user-response')) {
            // GrawLogger.log('User response detected, disabling previous feedback buttons.');
            // Use setTimeout to ensure the DOM updates fully before querying
            setTimeout(() => disablePreviousFeedbackButtons(node), 0);
          }
        });
      }
    }
  };

  observer = new MutationObserver(callback);
  observer.observe(targetNode, config);

  // Consider adding cleanup if the chat widget can be destroyed/re-created
  // e.g., observer.disconnect();
};

// const theme = {
//   primaryColor: activePrimaryColorForExtensions, // Main color of your chatbot
//   secondaryColor: "#3aafd1", // For buttons or highlights
//   cancelColor: "#8388A4", // For cancel button
//   borderColor: "#8388A4", // For container borders
//   textColor: "#333333", // Default text color
//   hoverColor: "#fff", // Button hover text color
//   negativeColor: "#B93333", // Color for negative buttons/highlights
// };

// const root = document.documentElement;
// Object.keys(theme).forEach((key) => {
//   root.style.setProperty(`--${key}`, theme[key]);
// });

// Helper function to make sure multiple extension types don't display at once
function removePreviousChatElements(...selectors) {
  const chatWidget = document
    .querySelector("#voiceflow-chat")
    ?.shadowRoot.querySelector(".vfrc-chat--dialog");

  if (!chatWidget) {
    return;
  }

  selectors.forEach(selector => {
    const targetElement = chatWidget.querySelector(selector);
    if (targetElement) {
      const containerElement = targetElement.closest(".vfrc-system-response");
      if (containerElement) {
        containerElement.remove();
      }
    }
  });
}

// This extension handles email verification by sending a code and verifying user input
const EmailVerificationExtension = {
  name: "EmailVerification",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_verify" || trace.payload?.name === "ext_verify",
  render: ({ trace, element }) => {

    const theme = window.GrawThemeManager.getTheme();

    removePreviousChatElements(".vfrc-email-verification");
    const verificationContainer = document.createElement("div");
    verificationContainer.innerHTML = `
        <style>
          .vfrc-message--extension-EmailVerification {
            background-color: transparent !important;
            background: none !important;
          }
          .vfrc-email-verification {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 10px;
            max-width: 220px;
            margin-left: auto;
            margin-right: auto;
          }
          .vfrc-code-inputs {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            width: 100%;
          }
          .vfrc-code-input {
            width: 28px;
            height: 32px;
            text-align: center;
            font-size: 16px;
            margin: 0 2px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          .vfrc-code-input:focus {
            border-color: ${theme.cancel};
            outline: none;
          }
          .vfrc-verification-message {
            margin-top: 10px;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
          }
        </style>
        <div class="vfrc-email-verification">
          <div class="vfrc-code-inputs">
            <input type="text" class="vfrc-code-input" maxlength="1">
            <input type="text" class="vfrc-code-input" maxlength="1">
            <input type="text" class="vfrc-code-input" maxlength="1">
            <input type="text" class="vfrc-code-input" maxlength="1">
          </div>
          <div class="vfrc-verification-message">Verification code sent to your email.</div>
        </div>
      `;

    const codeInputs =
      verificationContainer.querySelectorAll(".vfrc-code-input");
    const verificationMessage = verificationContainer.querySelector(
      ".vfrc-verification-message"
    );

    const checkVerificationCode = () => {
      const code = Array.from(codeInputs)
        .map((input) => input.value)
        .join("");
      if (code.length === 6) {
        verificationMessage.textContent = "";
        window.voiceflow.chat.interact({
          type: "to_verify",
          payload: { code },
        });
      }
    };

    const handleInput = (e, index) => {
      if (e.target.value.length === 1 && index < codeInputs.length - 1) {
        codeInputs[index + 1].focus();
      }
      if (Array.from(codeInputs).every((input) => input.value.length === 1)) {
        checkVerificationCode();
      }
    };

    const handleKeydown = (e, index) => {
      if (e.key === "Backspace" && e.target.value.length === 0 && index > 0) {
        codeInputs[index - 1].focus();
      }
    };

    codeInputs.forEach((input, index) => {
      input.addEventListener("input", (e) => handleInput(e, index));
      input.addEventListener("keydown", (e) => handleKeydown(e, index));
    });

    element.appendChild(verificationContainer);
    codeInputs[0].focus();
  },
};

const ItemTrackingExtension = {
  name: "ItemTracking",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_itemTracking" ||
    trace.payload?.name === "ext_itemTracking",
  render: ({ trace, element }) => {
    removePreviousChatElements(".item-tracking-container", ".item-return-container", ".item-cancellation-container", ".return-eval-container");

    const theme = window.GrawThemeManager.getTheme();
    const { order_no, items, refundedOrderIds = [] } = trace.payload;
    GrawLogger.log('Items at render time:', JSON.stringify(items, null, 2));
    const defaultImageURL =
      "https://0e3db0-b3.myshopify.com/cdn/shop/files/NewBalance_M1000V1.png?v=1726826154&width=120";

    let hasSubmitted = false; // Add submission flag
    const itemTrackingContainer = document.createElement("div");
    itemTrackingContainer.innerHTML = `
        <style>
          .vfrc-message--extension-ItemTracking {
            background-color: transparent !important;
            background: none !important;
          }
          .item-tracking-container {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid ${theme.border};
            border-radius: 8px;
            background-color: #fff;
          }
          .item-tracking-container.disabled {
            pointer-events: none;
            opacity: 0.6;
          }
          .item-tracking-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .order-number {
            font-size: 14px;
            margin-bottom: 20px;
          }
          .tracking-item {
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid ${theme.border};
            cursor: pointer;
            position: relative;
          }
          .tracking-item.already-cancelled .item-name,
          .tracking-item.already-cancelled .item-quantity {
            text-decoration: line-through;
            color: #666;
          }            
          .tracking-item:last-child {
            border-bottom: none;
          }
          .item-content {
            display: flex;
            align-items: flex-start;
          }
          .item-image {
            width: 130px;
            height: 50px;
            background-color: #fff;
            margin-right: 15px;
            background-size: cover;
            background-position: center;
            border-radius: 8%;
            object-fit: cover;
          }
          .item-details {
            flex-grow: 1;
            margin-right: 25px; /* Add space for the select indicator */
          }
          .item-name {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .item-price, .item-status {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .already-cancelled .item-status {
            color: ${theme.primary};
            font-weight: bold;
          }
          .already-cancelled .item-status {
            color: #9CA3AF !important;
          }
          .already-cancelled .radio-button {
            display: none;
          }      
          .item-price {
            font-weight: bold;
          }
          
          .radio-button {
            display: inline-block;
            position: relative;
            cursor: pointer;
            position: absolute;
            top: 16px;
            right: 16px;
          }
          
          .radio-button__input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .radio-button__custom {
            position: absolute;
            top: 0;
            left: 0;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid #555;
            transition: all 0.3s ease;
          }
          
          .tracking-item.selected .radio-button__custom {
            background-color: ${theme.primary};
            border-color: transparent;
            transform: scale(0.8);
            box-shadow: 0 0 20px ${theme.primary};
          }
          
          .tracking-item:hover .radio-button__custom {
            transform: scale(1.2);
            border-color: ${theme.primary};
            box-shadow: 0 0 20px ${theme.primary};
          }
          
          .button-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .submit-button {
            display: block;
            width: 100%;
            font-family: Arial, sans-serif;
            background-size: 220%;
            box-shadow: 0 .2em .3em rgba(0, 0, 0, 0.15);
            color: ${theme.primary};
            background-color: transparent;
            background-position: 100%;
            border: 1px solid ${theme.primary};
            padding: 8px 16px;
            border-radius: 3px;
            transition: all .2s ease-out;
            font-weight: 900;
            cursor: pointer;
            background-image: linear-gradient(110deg, ${theme.primary} 0%, ${theme.primary} 50%, transparent 50%, transparent 100%);
            font-size: 14px;
          }
          .submit-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 .3em rgba(0, 0, 0, 0.25);
            background-position: 0;
            color: #fff;
          }
          .submit-button:active {
            transform: translateY(-1px);
          }
          .cancel-button {
            display: block;
            width: 100%;
            font-family: Arial, sans-serif;
            background-size: 220%;
            box-shadow: 0 .2em .3em rgba(0, 0, 0, 0.15);
            color: ${theme.cancel};
            background-color: transparent;
            background-position: 100%;
            border: 1px solid ${theme.cancel};
            padding: 8px 16px;
            border-radius: 3px;
            transition: all .2s ease-out;
            font-weight: 900;
            cursor: pointer;
            background-image: linear-gradient(110deg, ${theme.cancel} 0%, ${theme.cancel} 50%, transparent 50%, transparent 100%);
            font-size: 14px;
          }
          .cancel-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 .3em rgba(0, 0, 0, 0.25);
            background-position: 0;
            color: #fff;
          }
          .cancel-button:active {
            transform: translateY(-1px);
          }
          .item-quantity {
            font-weight: normal;
          }
        </style>
        <div class="item-tracking-container">
          <div class="item-tracking-title">Select an Item to Track</div>
          <div class="order-number">Order Number: ${order_no}</div>
          ${items
            .map((item, index) => {
              const isAlreadyCancelled = refundedOrderIds.includes(item.id);
              GrawLogger.log(
                `Item ID ${item.id} is already cancelled: ${isAlreadyCancelled}`
              );
              const statusClass = isAlreadyCancelled ? "already-cancelled" : "";

              return `
                  <div class="tracking-item ${statusClass}" data-product-id="${
                item.product_id}" data-item-id="${item.id}">
                    <div class="item-content">
                      <div class="item-image" style="background-image: url('${
                        item.imageUrl || defaultImageURL
                      }');"></div>
                      <div class="item-details">
                        <div class="item-name">${
                          item.name
                        } <span class="item-quantity">(x${
                item.quantity
              })</span></div>
                        <div class="item-status">
                          ${
                            isAlreadyCancelled
                              ? "Item already cancelled"
                              : `Status: '${item.status}'`
                          }
                        </div>
                        <div class="item-price">${item.currency} ${Number(
                item.price
              ).toFixed(2)}</div>
                      </div>
                      ${
                        isAlreadyCancelled
                          ? ""
                          : `
                      <div class="radio-button">
                        <input type="radio" class="radio-button__input" id="radio${index}" name="radio-group">
                        <span class="radio-button__custom"></span>
                      </div>
                    `
                      }
                    </div>
                  </div>
          `;
            })
            .join("")}
          <div class="button-container">
            <button class="submit-button">Track Item</button>
            <button class="cancel-button">Cancel</button>
          </div>
        </div>
      `;

    const trackingItems =
      itemTrackingContainer.querySelectorAll(".tracking-item");
    const submitButton = itemTrackingContainer.querySelector(".submit-button");
    const cancelButton = itemTrackingContainer.querySelector(".cancel-button");

    let selectedProductId = null;
    let selectedItemId = null;

    trackingItems.forEach((item) => {
      item.addEventListener("click", () => {
        // Remove selection from all items
        trackingItems.forEach((otherItem) =>
          otherItem.classList.remove("selected")
        );

        // Add selection to clicked item
        item.classList.add("selected");
        selectedProductId = item.getAttribute("data-product-id");
        selectedItemId = item.getAttribute("data-item-id")
      });
    });

    submitButton.addEventListener("click", () => {
      if (hasSubmitted) return; // Prevent multiple submissions
      if (selectedProductId) {
        hasSubmitted = true;
        itemTrackingContainer.classList.add("disabled");
        const inputs = itemTrackingContainer.querySelectorAll("input, button");
        inputs.forEach((input) => (input.disabled = true));

        submitButton.disabled = true;

        window.voiceflow.chat.interact({
          type: "selected",
          payload: { product_id: selectedProductId,
                     item_id: selectedItemId 
                   },
        });
      }
    });

    cancelButton.addEventListener("click", () => {
      if (hasSubmitted) return;
      window.voiceflow.chat.interact({
        type: "cancelled",
      });
    });

    element.appendChild(itemTrackingContainer);
  },
};

// This extension handles order number input
const OrderNumberExtension = {
  name: "OrderNumber",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_order" || trace.payload?.name === "ext_order",
  render: ({ trace, element }) => {
    removePreviousChatElements(".vfrc-order-verification");
    const theme = window.GrawThemeManager.getTheme();

    const verificationContainer = document.createElement("div");
    verificationContainer.innerHTML = `
      <style>
        .vfrc-message--extension-OrderNumber {
          background-color: transparent !important;
          background: none !important;
        }
        .vfrc-order-verification {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 10px;
          max-width: 220px;
          margin-left: auto;
          margin-right: auto;
        }
        .vfrc-code-inputs {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          width: 100%;
        }
        .vfrc-code-input {
          width: 28px;
          height: 32px;
          text-align: center;
          font-size: 16px;
          margin: 0 2px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .vfrc-code-input:focus {
          border-color: ${theme.cancel};
          outline: none;
        }
        .vfrc-order-message {
          margin-top: 10px;
          font-weight: bold;
          font-size: 12px;
          text-align: center;
        }
      </style>
      <div class="vfrc-order-verification">
        <div class="vfrc-code-inputs">
          <input type="text" class="vfrc-code-input" maxlength="1">
          <input type="text" class="vfrc-code-input" maxlength="1">
          <input type="text" class="vfrc-code-input" maxlength="1">
          <input type="text" class="vfrc-code-input" maxlength="1">
        </div>
        <div class="vfrc-verification-message">Enter your order number here.</div>
      </div>
    `;

    const codeInputs =
      verificationContainer.querySelectorAll(".vfrc-code-input");
    const verificationMessage = verificationContainer.querySelector(
      ".vfrc-verification-message"
    );

    const checkVerificationCode = () => {
      const code = Array.from(codeInputs)
        .map((input) => input.value)
        .join("");
      if (code.length === 4) { // THIS IS CLIENT SPECIFIC
        verificationMessage.textContent = "";
        window.voiceflow.chat.interact({
          type: "code_accepted",
          payload: { code },
        });
      }
    };

    const handleInput = (e, index) => {
      if (e.target.value.length === 1 && index < codeInputs.length - 1) {
        codeInputs[index + 1].focus();
      }
      if (Array.from(codeInputs).every((input) => input.value.length === 1)) {
        checkVerificationCode();
      }
    };

    const handleKeydown = (e, index) => {
      if (e.key === "Backspace" && e.target.value.length === 0 && index > 0) {
        codeInputs[index - 1].focus();
      }
    };

    codeInputs.forEach((input, index) => {
      input.addEventListener("input", (e) => handleInput(e, index));
      input.addEventListener("keydown", (e) => handleKeydown(e, index));
    });

    element.appendChild(verificationContainer);
    codeInputs[0].focus();
  },
};

// This extension handles email verification by sending a code and verifying user input
const EmailVerificationExtension_v2 = {
  name: "EmailVerification_v2",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_verify_2" || trace.payload?.name === "ext_verify_2",
  render: async ({ trace, element }) => {
    removePreviousChatElements(".vfrc-email-verification");

    const theme = window.GrawThemeManager.getTheme();
    const email = trace.payload?.email || null;

    // Extract user ID from Voiceflow session in local storage
    let userId = null;
    try {
      const voiceflowSession = localStorage.getItem("voiceflow-session-xyz");
      if (voiceflowSession) {
        const sessionData = JSON.parse(voiceflowSession);
        userId = sessionData.userID;
      }
    } catch (error) {
      GrawLogger.error("Failed to extract user ID from Voiceflow session:", error);
    }

    const verificationContainer = document.createElement("div");

    verificationContainer.innerHTML = `
        <style>
          .vfrc-message--extension-EmailVerification {
            background-color: transparent !important;
            background: none !important;
          }
          .vfrc-email-verification {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 10px;
            max-width: 220px;
            margin-left: auto;
            margin-right: auto;
          }
          .vfrc-code-inputs {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            width: 100%;
          }
          .vfrc-code-input {
            width: 28px;
            height: 32px;
            text-align: center;
            font-size: 16px;
            margin: 0 2px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
            .vfrc-code-input:focus {
            border-color: ${theme.cancel};
            outline: none;
          }
          .vfrc-verification-message {
            margin-top: 10px;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
          }
          .verify-error {
            display: flex;
            align-items: center;
            font-size: 12px;
            color: ${theme.cancel};
            background-color: none;
            border: 1px solid ${theme.cancel};
            border-radius: 8px;
            padding: 10px;
            margin-top: 10px;
          }
          .verify-error svg {
            margin-right: 10px;
            fill: ${theme.cancel};
          }
          .verify-error p {
            margin: 0;
            color: ${theme.cancel};
          }
        </style>
        <div class="vfrc-email-verification">
          <div class="vfrc-code-inputs">
            <input type="text" class="vfrc-code-input" maxlength="1">
            <input type="text" class="vfrc-code-input" maxlength="1">
            <input type="text" class="vfrc-code-input" maxlength="1">
            <input type="text" class="vfrc-code-input" maxlength="1">
            <input type="text" class="vfrc-code-input" maxlength="1">
            <input type="text" class="vfrc-code-input" maxlength="1">
          </div>
          <div class="vfrc-verification-message"></div>
        </div>
      `;

    const codeInputs =
      verificationContainer.querySelectorAll(".vfrc-code-input");
    const verificationMessage = verificationContainer.querySelector(
      ".vfrc-verification-message"
    );

    const hideCodeInputs = () => {
      const codeInputsContainer =
        verificationContainer.querySelector(".vfrc-code-inputs");
      codeInputsContainer.style.display = "none";
    };

    let remainingTries = 3;
    let maxAttemptsReached = false;

    // Send verification email automatically
    try {
      GrawLogger.log("Sending verification email to", email);
      const response = await fetch(`${SERVER_URL}/send-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!data.success) {
        if (data.maxAttemptsReached) {
          throw new Error(
            "Maximum verification attempts reached. Please try again later."
          );
        }
        throw new Error(data.error || "Failed to send verification email");
      }
      verificationMessage.textContent = "Verification code sent to your email.";
      codeInputs[0].focus();
    } catch (error) {
      if (error.message.includes("Maximum verification attempts reached")) {
        verificationMessage.innerHTML = `<div class="verify-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg><p>Maximum attempts reached.</br>Please wait 5 minutes before trying again.</p></div>`;
        hideCodeInputs();
      } else {
        verificationMessage.innerHTML = `<div class="verify-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg><p>Failed to send verification email.</p></div>`;
        hideCodeInputs();
      }
    }

    const checkVerificationCode = async () => {
      const code = Array.from(codeInputs)
        .map((input) => input.value)
        .join("");
      if (code.length === 6) {
        try {
          const response = await fetch(`${SERVER_URL}/check-verification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, code, userId }),
          });
          const data = await response.json();
          if (data.success && data.status === "approved") {
            codeInputs.forEach((input) => (input.disabled = true));
            window.voiceflow.chat.interact({
              type: "verified",
            });
            verificationContainer.style.display = "none";
          } else {
            remainingTries--;
            if (remainingTries > 0) {
              verificationMessage.textContent = `Invalid code. ${remainingTries} ${
                remainingTries === 1 ? "try" : "tries"
              } remaining.`;
              verificationMessage.style.color = "orange";
              codeInputs.forEach((input) => {
                input.value = "";
                input.disabled = false;
              });
              codeInputs[0].focus();
            } else {
              maxAttemptsReached = true;
              verificationMessage.innerHTML = `<div class="verify-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg><p>Maximum attempts reached.</br>Please wait 5 minutes before trying again.</p></div>`;
              codeInputs.forEach((input) => (input.disabled = true));
              window.voiceflow.chat.interact({
                type: "max attempts",
              });
              hideCodeInputs();
            }
          }
        } catch (error) {
          verificationMessage.innerHTML = `<div class="verify-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg><p>Failed to verify code. Please try again.</p></div>`;
          if (remainingTries > 0) {
            codeInputs.forEach((input) => {
              input.value = "";
              input.disabled = false;
            });
            codeInputs[0].focus();
          } else {
            maxAttemptsReached = true;
            verificationMessage.innerHTML = `<div class="verify-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg><p>Maximum attempts reached.</br>Please wait 5 minutes before trying again.</p></div>`;
            codeInputs.forEach((input) => (input.disabled = true));
            window.voiceflow.chat.interact({
              type: "max attempts",
            });
            hideCodeInputs();
          }
        }
      }
    };

    const handleInput = (e, index) => {
      if (!maxAttemptsReached && remainingTries > 0) {
        if (e.target.value.length === 1 && index < codeInputs.length - 1) {
          codeInputs[index + 1].focus();
        }
        if (Array.from(codeInputs).every((input) => input.value.length === 1)) {
          checkVerificationCode();
        }
      }
    };

    const handleKeydown = (e, index) => {
      if (!maxAttemptsReached && remainingTries > 0) {
        if (e.key === "Backspace" && e.target.value.length === 0 && index > 0) {
          codeInputs[index - 1].focus();
        }
      }
    };

    const handlePaste = (e) => {
      if (!maxAttemptsReached && remainingTries > 0) {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData(
          "text"
        );
        const code = pastedText.replace(/\D/g, "").slice(0, 6);

        if (code.length === 6) {
          Array.from(codeInputs).forEach((input, index) => {
            input.value = code[index];
          });
          checkVerificationCode();
        }
      }
    };

    codeInputs.forEach((input, index) => {
      input.addEventListener("input", (e) => handleInput(e, index));
      input.addEventListener("keydown", (e) => handleKeydown(e, index));
      input.addEventListener("paste", handlePaste);
    });

    element.appendChild(verificationContainer);
    codeInputs[0].focus();
  },
};

// This extension pulls up a list of shopify orders for a customer
const ShopifyOrderListExtension = {
  name: "ShopifyOrderList",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_shopifyOrderList" ||
    trace.payload?.name === "ext_shopifyOrderList",
  render: ({ trace, element }) => {
    removePreviousChatElements(".vfrc-search-container", ".vfrc-order-list-container");

    const theme = window.GrawThemeManager.getTheme();
    const orders = trace.payload.orders || [];
    const orderIds = trace.payload.orderIds || [];
    const refundedOrderIds = trace.payload.refundedOrderIds || [];

    if (!orders.length) {
      const emptyContainer = document.createElement("div");
      emptyContainer.innerHTML = `
        <div class="vfrc-empty-state">
          <p>No orders found</p>
        </div>
      `;
      window.voiceflow.chat.interact({ type: "no_orders_exist" });
      element.appendChild(emptyContainer);
      return;
    }

    const numericOrderIds = orderIds.map((id) => Number(id));
    const filteredOrders = (
      numericOrderIds.length
        ? orders.filter((order) => numericOrderIds.includes(order.id))
        : orders
    ).sort((a, b) => new Date(b.processed_at) - new Date(a.processed_at));

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const groupOrdersByMonth = (orders) => {
      return orders.reduce((groups, order) => {
        const date = new Date(order.processed_at);
        const monthYear = date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push(order);
        return groups;
      }, {});
    };

    const orderListContainer = document.createElement("div");
    let hasSubmitted = false;
    orderListContainer.className = "vfrc-order-list-container";

    orderListContainer.innerHTML = `
        <style>
          .vfrc-message--extension-ShopifyOrderList {
            background-color: transparent !important;
            background: none !important;
          }
          .vfrc-order-list-container {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 0 auto;
          }
          .vfrc-month-group {
            margin-bottom: 24px;
          }
          .vfrc-month-header {
            font-size: 14px;
            font-weight: bold;
            color: #666;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid ${theme.border};
          }
          .vfrc-search-container {
            position: sticky;
            top: 0;
            background: white;
            padding: 10px 0;
            z-index: 1;
            margin-bottom: 16px;
            max-width: 400px;
          }
          .vfrc-search-input {
            width: 100%;
            padding: 8px;
            border: 1px solid ${theme.border};
            border-radius: 4px;
            font-size: 14px;
          }
          .vfrc-order-item {
            border: 1px solid ${theme.border};
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            cursor: pointer;
            position: relative;
            transition: all 0.2s ease-out;
          }
          .vfrc-order-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border-color: ${theme.primary};
          }
          .vfrc-order-item.selected {
            border: 1px solid ${theme.primary};
            background-color: #fff;
          }
          .vfrc-order-number {
            font-weight: bold;
            margin-bottom: 8px;
          }
          .vfrc-order-date {
            font-size: 15px;
            color: #666;
            margin-bottom: 8px;
          }
          .vfrc-order-products {
            margin-bottom: 12px;
          }
          .vfrc-order-product {
            font-size: 14px;
            font-weight: 300;
            margin-bottom: 4px;
          }
          .vfrc-order-product s {
            position: relative;
            cursor: help;
          }
          .vfrc-order-product s::after {
            content: "This item has been refunded";
            position: absolute;
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s, transform 0.2s;
            white-space: nowrap;
            margin-left: 8px;
          }
          .vfrc-order-product s:hover::after {
            opacity: 1;
          }
          .radio-button {
            display: inline-block;
            position: absolute;
            top: 16px;
            right: 30px;
            cursor: pointer;
          }
          
          .radio-button__input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .radio-button__custom {
            position: absolute;
            top: 0;
            left: 0;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid #555;
            transition: all 0.3s ease;
          }
          
          .vfrc-order-item.selected .radio-button__custom {
            background-color: ${theme.primary};
            border-color: transparent;
            transform: scale(0.8);
            box-shadow: 0 0 20px ${theme.primary};
          }
          
          .vfrc-order-item:hover .radio-button__custom {
            /* Scale down slightly to ensure it stays within the container */
            transform: scale(1.1);
            border-color: ${theme.primary};
            box-shadow: 0 0 10px ${theme.primary};
          }
          .vfrc-order-list-button {
            display: block;
            width: 100%;
            font-family: Arial, sans-serif;
            margin-top: 8px;
            margin-bottom: 16px;
            background-size: 220%;
            box-shadow: 0 .2em .3em rgba(0, 0, 0, 0.15);
            color: ${theme.cancel};
            background-color: transparent;
            background-position: 100%;
            border: 1px solid ${theme.primary};
            padding: 8px 16px;
            border-radius: 3px;
            transition: all .2s ease-out;
            font-weight: 900;
            cursor: pointer;
            background-image: linear-gradient(110deg, ${theme.primary} 0%, ${theme.primary} 50%, transparent 50%, transparent 100%);
            font-size: 14px;
          }
          .vfrc-order-list-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 .3em rgba(0, 0, 0, 0.25);
            background-position: 0;
            color: #fff;
          }
          .loading-icon {
            width: 20px;
            height: 20px;
            border: 5px solid;
            border-color: ${theme.primary} transparent;
            border-radius: 50%;
            display: inline-block;
            -webkit-animation: rotation 1s linear infinite;
                    animation: rotation 1s linear infinite;
          }
          @-webkit-keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 200px;
            max-width: 400px;
          }
          .vfrc-orders-list {
            min-height: 200px;
          }
          /* Loading Animation Styles */
          .load-wrapp {
            max-width: 400px;
            height: 500px;
            margin: 0;
            border-radius: 5px;
            text-align: center;
            display: none;
          }
          .load-3 {
            display: flex;
            justify-content: center;
            gap: 8px;
          }
          .line {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 8px;
            background-color: ${theme.primary};
          }
          .load-3 .line:nth-last-child(1) {
            animation: loadingC 0.6s 0.1s linear infinite;
          }
          .load-3 .line:nth-last-child(2) {
            animation: loadingC 0.6s 0.2s linear infinite;
          }
          .load-3 .line:nth-last-child(3) {
            animation: loadingC 0.6s 0.3s linear infinite;
          }
          @keyframes loadingC {
            0% {
              transform: translate(0, 0);
            }
            50% {
              transform: translate(0, 15px);
            }
            100% {
              transform: translate(0, 0);
            }
          }
        </style>
        
        <div class="vfrc-search-container">
          <input type="text" class="vfrc-search-input" placeholder="Search orders by number or product name...">
        </div>

        <div class="load-wrapp">
          <div class="load-3">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
          </div>
        </div>


        <div class="vfrc-orders-list"></div>

        <button class="vfrc-order-list-button" id="no-order-found">I don't see my order</button>
    `;

    let searchTimeout;
    const renderOrdersList = (searchTerm = "") => {
      const filteredBySearch = searchTerm
        ? filteredOrders.filter(
            (order) =>
              order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.line_items.some((item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
          )
        : filteredOrders;

      const groupedOrders = groupOrdersByMonth(filteredBySearch);
      const ordersList = orderListContainer.querySelector(".vfrc-orders-list");

      // If no orders match the search, show "no results" message
      if (searchTerm && filteredBySearch.length === 0) {
        ordersList.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #666;">
            No orders found matching "${searchTerm}"
          </div>
        `;
      }

      ordersList.innerHTML = Object.entries(groupedOrders)
        .map(
          ([monthYear, monthOrders]) => `
          <div class="vfrc-month-group">
            <div class="vfrc-month-header">${monthYear}</div>
            ${monthOrders
              .map((order) => {
                const hasRefundedItems = order.line_items.some((product) =>
                  refundedOrderIds.includes(product.id)
                );

                const isFullyRefunded = order.line_items.every((product) =>
                  refundedOrderIds.includes(product.id)
                );

                return `
                <div class="vfrc-order-item" data-order-id="${order.id}">
                <div class="vfrc-order-number">${
                  isFullyRefunded
                    ? "<s>Order " + order.name + "</s>"
                    : "Order " + order.name
                }</div>
                  <div class="vfrc-order-date">
                    ${formatDate(order.processed_at)}
                    <br>
                    Total: 
                      <b>
                        ${
                          hasRefundedItems
                            ? `<s>${order.total_price_set.presentment_money.amount} ${order.total_price_set.presentment_money.currency_code}</s> ${order.current_total_price_set.presentment_money.amount} ${order.current_total_price_set.presentment_money.currency_code}`
                            : `${order.total_price_set.presentment_money.amount} ${order.total_price_set.presentment_money.currency_code}`
                        }
                      </b>
                  </div>
                  <div class="vfrc-order-products">
                      ${
                        isFullyRefunded
                          ? '<div class="vfrc-order-product">Order already cancelled & refunded</div>'
                          : order.line_items
                              .map((product) => {
                                const isRefunded = refundedOrderIds.includes(
                                  product.id
                                );
                                return `
                                <div class="vfrc-order-product">
                                  ${
                                    isRefunded
                                      ? `<s>• ${product.name} (x${product.quantity})</s>`
                                      : `• ${product.name} (x${product.quantity})`
                                  }
                                </div>
                              `;
                              })
                              .join("")
                      }
                    </div>
                    ${
                      isFullyRefunded
                        ? ""
                        : `
                          <div class="radio-button">
                            <input type="radio" class="radio-button__input" name="radio-order-group">
                            <span class="radio-button__custom"></span>
                          </div>
                    `
                    }
                </div>
              `;
              })
              .join("")}
          </div>
        `
        )
        .join("");

      attachOrderItemListeners();
    };

    const searchInput = orderListContainer.querySelector(".vfrc-search-input");
    const loadingAnimation = orderListContainer.querySelector(".load-wrapp");
    const ordersList = orderListContainer.querySelector(".vfrc-orders-list");

    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.trim();

      // Show loading animation
      loadingAnimation.style.display = "block";
      ordersList.style.display = "none";

      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set new timeout
      searchTimeout = setTimeout(() => {
        // Force a re-render with the search term
        renderOrdersList(searchTerm);

        // After rendering, show the list and hide loading
        loadingAnimation.style.display = "none";
        ordersList.style.display = "block";
      }, 300);
    });

    const attachOrderItemListeners = () => {
      const orderItems =
        orderListContainer.querySelectorAll(".vfrc-order-item");
      let selectedOrderId = null;

      orderItems.forEach((item) => {
        item.addEventListener("click", () => {
          const orderId = item.dataset.orderId;
          const order = filteredOrders.find(
            (order) => order.id === Number(orderId)
          );
          const isFullyRefunded = order.line_items.every((product) =>
            refundedOrderIds.includes(product.id)
          );

          if (hasSubmitted || isFullyRefunded) return;
          orderItems.forEach((otherItem) =>
            otherItem.classList.remove("selected")
          );
          item.classList.add("selected");
          selectedOrderId = item.dataset.orderId;

          if (selectedOrderId) {
            const selectedOrder = filteredOrders.find(
              (order) => order.id === Number(selectedOrderId)
            );

            if (selectedOrder) {
              const nonRefundedCount = selectedOrder.line_items.filter(
                (item) => !refundedOrderIds.includes(item.id)
              ).length;

              hasSubmitted = true;

              window.voiceflow.chat.interact({
                type: "selected",
                payload: {
                  selectedOrderId: selectedOrderId,
                  nonRefundedCount: nonRefundedCount,
                  totalOrderAmount: `${selectedOrder.total_price_set.presentment_money.amount} ${selectedOrder.total_price_set.presentment_money.currency_code}`,
                },
              });
            }
          }
        });
      });
    };

    renderOrdersList();

    const noOrderButton = orderListContainer.querySelector(
      ".vfrc-order-list-button"
    );
    noOrderButton.addEventListener("click", () => {
      window.voiceflow.chat.interact({
        type: "noOrderFound",
      });
    });

    element.appendChild(orderListContainer);
  },
};

// This extension triggers a "done" action,
// typically used to signal the completion of a task
// and hide a previous WaitingAnimation
const DoneAnimationExtension = {
  name: "DoneAnimation",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_doneAnimation" ||
    trace.payload?.name === "ext_doneAnimation",
  render: async ({ trace, element }) => {
    window.vf_done = true;
    await new Promise((resolve) => setTimeout(resolve, 250));

    window.voiceflow.chat.interact({
      type: "continue",
    });
  },
};

// This extension shows a waiting animation with customizable text and delay
// Also checking for the vf_done value to stop/hide the animation if it's true
const WaitingAnimationExtension = {
  name: "WaitingAnimation",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_waitingAnimation" ||
    trace.payload?.name === "ext_waitingAnimation",
  render: async ({ trace, element }) => {
    window.vf_done = true;
    await new Promise((resolve) => setTimeout(resolve, 250));

    const text = trace.payload?.text || "Thinking...";
    const delay = trace.payload?.delay || 3000;

    const waitingContainer = document.createElement("div");
    waitingContainer.innerHTML = `
        <style>
          .vfrc-message--extension-WaitingAnimation {
            background-color: transparent !important;
            background: none !important;
          }
          .waiting-animation-container {
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: 300;
            color: #fffc;
            display: flex;
            align-items: center;
          }
          .waiting-text {
            display: inline-block;
            margin-left: 10px;
          }
          .waiting-letter {
            display: inline-block;
            animation: shine 1s linear infinite;
          }
          @keyframes shine {
            0%, 100% { color: #fffc; }
            50% { color: #000; }
          }
        </style>
        <div class="waiting-animation-container">
          <span class="waiting-text">${text
            .split("")
            .map((letter, index) =>
              letter === " "
                ? " "
                : `<span class="waiting-letter" style="animation-delay: ${
                    index * (1000 / text.length)
                  }ms">${letter}</span>`
            )
            .join("")}</span>
        </div>
      `;

    element.appendChild(waitingContainer);

    window.voiceflow.chat.interact({
      type: "continue",
    });

    let intervalCleared = false;
    window.vf_done = false;

    const checkDoneInterval = setInterval(() => {
      if (window.vf_done) {
        clearInterval(checkDoneInterval);
        waitingContainer.style.display = "none";
        window.vf_done = false;
      }
    }, 100);

    setTimeout(() => {
      if (!intervalCleared) {
        clearInterval(checkDoneInterval);
        waitingContainer.style.display = "none";
      }
    }, delay);
  },
};

// This extension displays a gift card with a specified amount and code
const GiftCardDisplayExtension = {
  name: "GiftCardDisplay",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_giftCardDisplay" ||
    trace.payload?.name === "ext_giftCardDisplay",
  render: ({ trace, element }) => {
    const amount = trace.payload.amount || "20";
    const theme = window.GrawThemeManager.getTheme();
    const currencySign = trace.payload.currencySign || "$";
    const discountPercentage = trace.payload.discount_percentage; // New variable to capture discount percentage
    const code = (trace.payload.code || "G9FD5FEG8HDC8A94").toUpperCase();
    const formattedCode = discountPercentage
      ? code
      : code.match(/.{1,4}/g).join(" ");

    removePreviousChatElements(".gift-card-container");

    const giftCardContainer = document.createElement("div");
    giftCardContainer.innerHTML = `
        <style>
          .vfrc-message--extension-GiftCardDisplay {
            background-color: transparent !important;
            background: none !important;
          }
          .gift-card-container {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background-color: #fff;
            text-align: center;
            position: relative;
          }
          .gift-card-image {
            width: 100%;
            max-width: 400px;
            border-radius: 8px;
            position: relative;
          }
          .gift-card-amount {
            width: 100%;
            max-width: 350px;
            font-size: 50px;
            font-weight: bold;
            color: #fff;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }
          .gift-card-code {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            background-color: none;
            padding: 10px;
            border-radius: 4px;
            display: inline-block;
          }
          .copy-button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 14px;
            color: ${theme.cancel} !important;
            background-color: #fff !important;
            border: 1px solid ${theme.cancel} !important;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          .copy-button:hover {
            background-color: ${theme.cancel} !important;
            color: #fff !important;
          }
        </style>
        <div class="gift-card-container">
          <div class="gift-card-image">
            <img src="https://s3.amazonaws.com/com.voiceflow.studio/share/card/card.jpg" alt="Gift Card" class="gift-card-image">
            <div class="gift-card-amount">
              ${
                discountPercentage
                  ? `${discountPercentage}% Off` // Display discount percentage if available
                  : `${currencySign}${amount}` // Default display for currency and amount
              }
            </div>
          </div>
          <div class="gift-card-code" id="gift-card-code">${formattedCode}</div>
          <button class="copy-button" id="copy-button">Copy Code</button>
        </div>
      `;

    const copyButton = giftCardContainer.querySelector("#copy-button");
    const giftCardCode = giftCardContainer.querySelector("#gift-card-code");

    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(giftCardCode.textContent).then(() => {
        alert("Gift card code copied to clipboard!");
      });
    });

    element.appendChild(giftCardContainer);
  },
};

const ConfettiExtension = {
  name: "Confetti",
  type: "effect",
  match: ({ trace }) =>
    trace.type === "ext_confetti" || trace.payload?.name === "ext_confetti",
  effect: ({ trace }) => {
    const canvas = document.querySelector("#confetti-canvas");

    var myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });
    myConfetti({
      particleCount: 200,
      spread: 160,
    });
  },
};

const FileUploadExtension = {
  name: "FileUpload",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_fileUpload" || trace.payload?.name === "ext_fileUpload",
  render: ({ trace, element }) => {
    const fileUploadContainer = document.createElement("div");
    fileUploadContainer.innerHTML = `
        <style>
          .my-file-upload {
            border: 2px dashed rgba(46, 110, 225, 0.3);
            padding: 20px;
            text-align: center;
            cursor: pointer;
          }
        </style>
        <div class='my-file-upload'>Drag and drop a file here or click to upload</div>
        <input type='file' style='display: none;'>
      `;

    const fileInput = fileUploadContainer.querySelector("input[type=file]");
    const fileUploadBox = fileUploadContainer.querySelector(".my-file-upload");

    fileUploadBox.addEventListener("click", function () {
      fileInput.click();
    });

    fileInput.addEventListener("change", function () {
      const file = fileInput.files[0];
      GrawLogger.log("File selected:", file);

      fileUploadContainer.innerHTML = `<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/upload/upload.gif" alt="Upload" width="50" height="50">`;

      var data = new FormData();
      data.append("file", file);

      fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: data,
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Upload failed: " + response.statusText);
          }
        })
        .then((result) => {
          fileUploadContainer.innerHTML =
            '<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/check/check.gif" alt="Done" width="50" height="50">';
          GrawLogger.log("File uploaded:", result.data.url);
          window.voiceflow.chat.interact({
            type: "complete",
            payload: {
              file: result.data.url.replace(
                "https://tmpfiles.org/",
                "https://tmpfiles.org/dl/"
              ),
            },
          });
        })
        .catch((error) => {
          GrawLogger.error(error);
          fileUploadContainer.innerHTML = "<div>Error during upload</div>";
        });
    });

    element.appendChild(fileUploadContainer);
  },
};

const FeedbackExtension = {
  name: "Feedback",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_feedback" || trace.payload?.name === "ext_feedback",
  render: ({ trace, element }) => {
    removePreviousChatElements(".vfrc-feedback");

    const feedbackContainer = document.createElement("div");

    const theme = window.GrawThemeManager.getTheme();

    // --- UPDATED: Styles ---
    feedbackContainer.innerHTML = `
            <style>
            .vfrc-feedback {
                display: flex;
                align-items: center;
                justify-content: space-between; /* Keep space between text and buttons */
                padding: 4px 10px;
                /*border: 1px solid #ddd;
                border-radius: 6px;*/
            }
            .vfrc-feedback--description {
                font-size: 0.75em; /* Slightly larger text */
                color: grey;
                pointer-events: none;
                margin-right: 8px; /* More space */
                font-family: 'Rubik', sans-serif; /* Ensure fallback font */
            }
            .vfrc-feedback--buttons {
                display: flex;
                gap: 10px; /* Increase gap between buttons */
            }

            /* Style the button itself */
            .vfrc-feedback--button {
                padding: 2px; /* Minimal padding */
                border: none;
                background: none;
                cursor: pointer;
                line-height: 0; /* Prevent extra space from line height */
                transition: transform 0.2s ease-in-out; /* Smooth transform */
            }

            /* Style the SVG inside the button */
            .vfrc-feedback--button svg {
                width: 20px; /* Explicit size */
                height: 20px; /* Explicit size */
                fill: #999; /* Default grey fill */
                transition: fill 0.3s ease, transform 0.3s ease; /* Transition fill and transform */
                display: block; /* Ensure SVG behaves like a block */
            }

            /* Hover effect: slight scale and rotation */
            .vfrc-feedback--button:not(.disabled):not(.selected):hover svg {
                transform: scale(1.15) rotate(-8deg);
                fill: #666; /* Darken slightly on hover */
            }

            /* Selected state for Thumb Up */
            .vfrc-feedback--button.selected.thumb-up svg {
                fill: ${theme.primary}; /* Use theme primary color */
                transform: scale(1.05); /* Slight scale when selected */
            }

            /* Selected state for Thumb Down */
            .vfrc-feedback--button.selected.thumb-down svg {
                fill: ${theme.negative}; /* Use theme negative color */
                 transform: scale(1.05); /* Slight scale when selected */
            }

            /* Disabled state */
            .vfrc-feedback--button.disabled {
                cursor: default;
                pointer-events: none; /* Make sure it's not clickable */
            }
            .vfrc-feedback--button.disabled svg {
                opacity: 0.66; /* Fade out disabled icons */
                fill: #bbb; /* Use a light grey for disabled fill */
                transform: none; /* Reset transform */
            }
          </style>
          <div class="vfrc-feedback">
            <div class="vfrc-feedback--description">Was this helpful?</div>
            <div class="vfrc-feedback--buttons">
              <button class="vfrc-feedback--button thumb-up" data-feedback="positive">${SVG_ThumbUp}</button>
              <button class="vfrc-feedback--button thumb-down" data-feedback="negative">${SVG_ThumbDown}</button>
            </div>
          </div>
        `;

    // --- Click Handler (Logic remains similar) ---
    const handleFeedbackClick = function (event) {
      // Use currentTarget to ensure we get the button even if click is on SVG
      const button = event.currentTarget;
      const feedback = button.getAttribute("data-feedback");

      window.voiceflow.chat.interact({
        type: "complete",
        payload: { feedback: feedback },
      });

      // Disable *all* buttons within this specific feedback container
      const parentContainer = button.closest('.vfrc-feedback');
      if (parentContainer) {
          parentContainer.querySelectorAll(".vfrc-feedback--button").forEach((btn) => {
            btn.classList.add("disabled"); // Add disabled class
            if (btn === button) {
              btn.classList.add("selected"); // Add selected class to the clicked one
            }
            // Remove listener to prevent multiple submissions if something goes wrong
            btn.removeEventListener('click', handleFeedbackClick);
          });
      }
    };

    // Attach the named listener to buttons
    feedbackContainer
      .querySelectorAll(".vfrc-feedback--button")
      .forEach((button) => {
        // Pass the function reference
        button.addEventListener("click", handleFeedbackClick);
      });

    element.appendChild(feedbackContainer);
  },
};


const EmailInputExtension = {
  name: "EmailInput",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_email" || trace.payload?.name === "ext_email",
  render: ({ trace, element }) => {
    removePreviousChatElements(".email-input-container");

    const theme = window.GrawThemeManager.getTheme();

    const emailInputContainer = document.createElement("div");
    let hasSubmitted = false; // Add submission flag

    emailInputContainer.innerHTML = `
      <style>
        .email-input-container {
          width: 100%;
          padding: 20px !important;
          box-sizing: border-box;
        }
        .flipper-input {
          position: relative;
          perspective: 500px;
          color: #fff;
          margin-bottom: 16px;
          width: 100%;
        }
        .flipper-input__input {
          width: 100%;
          background-color: ${theme.primary};
          background-image: linear-gradient(to top left, rgba(255,255,255,.2), rgba(255,255,255,.05));
          color: ${theme.text};
          padding: 10px;
          font-size: 15px;
          border: none;
          border-radius: 2px;
          transform-origin: 50% 100%;
          transition: .4s cubic-bezier(0.34, 1.4, 0.64, 1);
          transform: rotateX(90deg);
          outline: none;
          box-sizing: border-box;
        }
        .flipper-input__input.invalid {
          background-color: #FB6573;
        }
        .flipper-input__input::placeholder {
          color: rgba(255,255,255,.6);
        }
        .flipper-input__input:focus,
        .flipper-input__input:not(:placeholder-shown) {
          transform: rotateX(0);
          background-color: ${theme.primary};
          box-shadow: 0 1px 5px 0 rgba(0,0,0,.3);
        }
        .error-tooltip {
          display: none;
          position: absolute;
          background: #FB6573;
          color: white;
          padding: 5px 10px;
          border-radius: 3px;
          font-size: 12px;
          bottom: calc(100% + 5px);
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          z-index: 10;
        }
        .error-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          border: 5px solid transparent;
          border-top-color: #FB6573;
          transform: translateX(-50%);
        }
        .flipper-input__input:focus.invalid ~ .error-tooltip {
          display: block;
        }
        .submit-button {
          display: block;
          width: 100%;
          font-family: Arial, sans-serif;
          background-size: 220%;
          box-shadow: 0 .2em .3em rgba(0, 0, 0, 0.15);
          color: ${theme.primary};
          background-color: transparent;
          background-position: 100%;
          border: 1px solid ${theme.primary};
          padding: 8px 16px;
          border-radius: 3px;
          transition: all .2s ease-out;
          font-weight: 900;
          cursor: pointer;
          background-image: linear-gradient(110deg, ${theme.primary} 0%, ${theme.primary} 50%, transparent 50%, transparent 100%);
          font-size: 14px;
        }
        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 .3em rgba(0, 0, 0, 0.25);
          background-position: 0;
          color: #fff;
        }
        .submit-button:active {
          transform: translateY(-1px);
        }
        .flipper-input__label {
          position: absolute;
          z-index: 2;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          padding-left: 10px;
          font-size: 15px;
          font-weight: 500;
          color: ${theme.primary};
          transition: .1s ease;
          transform-origin: bottom center;
          cursor: text;
        }
        .flipper-input__input:not(:placeholder-shown) ~ .flipper-input__label,
        .flipper-input__input:focus ~ .flipper-input__label {
          opacity: 0;
          visibility: hidden;
        }
        .flipper-input__label::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          display: block;
          width: 100%;
          height: 2px;
          border-radius: 2px;
          background-color: ${theme.primary};
          transition: .4s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: bottom center;
        }
        .flipper-input__input:not(:placeholder-shown) ~ .flipper-input__label::after,
        .flipper-input__input:focus ~ .flipper-input__label::after {
          transform: rotateX(90deg);
        }
      </style>
      <div class="email-input-container">
        <div class="flipper-input">
          <input class="flipper-input__input" type="email" id="email" placeholder=" ">
          <label class="flipper-input__label" for="email">Email Address</label>
          <div class="error-tooltip">Please enter a valid email address</div>
        </div>
        <button class="submit-button">Submit</button>
      </div>
    `;

    const emailInput = emailInputContainer.querySelector(
      ".flipper-input__input"
    );
    const submitButton = emailInputContainer.querySelector(".submit-button");

    const validateEmail = () => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailInput.value.trim()
      );
      emailInput.classList.toggle("invalid", !isValid);
      return isValid;
    };

    emailInput.addEventListener("input", validateEmail);
    emailInput.addEventListener("blur", () => {
      validateEmail();
    });

    submitButton.addEventListener("click", () => {
      if (hasSubmitted) return; // Prevent multiple submissions
      if (validateEmail()) {
        hasSubmitted = true; // Set flag after successful submission
        window.voiceflow.chat.interact({
          type: "submitted",
          payload: { email: emailInput.value.trim() },
        });
      }
    });

    emailInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        submitButton.click();
      }
    });

    element.appendChild(emailInputContainer);
  },
};

const CancelItemExtension = {
  name: "CancelItem",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_cancelItem" || trace.payload?.name === "ext_cancelItem",
  render: ({ trace, element }) => {
    removePreviousChatElements(".item-tracking-container", ".item-return-container", ".item-cancellation-container", ".return-eval-container");

    const theme = window.GrawThemeManager.getTheme();
    const { order_no, items, refundedOrderIds = [] } = trace.payload;
    let hasSubmitted = false; // Add submission flag

    const defaultImageURL =
      "https://e7.pngegg.com/pngimages/829/733/png-clipart-logo-brand-product-trademark-font-not-found-logo-brand-thumbnail.png";

    const cancelItemContainer = document.createElement("div");

    cancelItemContainer.innerHTML = `
        <style>
          .vfrc-message--extension-CancelItem {
            background-color: transparent !important;
            background: none !important;
          }
          .item-cancellation-container {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid ${theme.border};
            border-radius: 8px;
            background-color: #fff;
          }
          .item-cancellation-container.disabled {
            pointer-events: none;
            opacity: 0.6;
          }
          .item-cancellation-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .order-number {
            font-size: 14px;
            margin-bottom: 20px;
          }
          .cancellation-item {
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid ${theme.border};
            transition: background-color 0.2s ease;
            border-radius: 8px;
            padding: 10px;
          }
          .cancellation-item:hover {
            background-color: rgba(0, 0, 0, 0.02);
          }
          .cancellation-item.non-cancellable {
            opacity: 0.85;
          }
          .cancellation-item.already-cancelled .item-name,
          .cancellation-item.already-cancelled .item-quantity {
            text-decoration: line-through;
            color: #666;
          }
          .cancellation-item:last-child {
            border-bottom: none;
          }
          .item-content {
            display: flex;
            align-items: flex-start;
          }
          .item-image {
            width: 130px;
            height: 50px;
            background-color: #fff;
            margin-right: 15px;
            background-size: cover;
            background-position: center;
            border-radius: 8%;
            object-fit: cover;
          }
          .item-details {
            flex-grow: 1;
          }
          .item-name {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .item-price, .item-status {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .non-cancellable .item-status,
          .already-cancelled .item-status {
            color: ${theme.primary};
            font-weight: bold;
          }
          .already-cancelled .item-status {
            color: #9CA3AF !important;
          }
          .item-price {
            font-weight: bold;
          }
          .item-checkbox {
            margin-left: 10px;
            margin-top: 5px;
          }
          .non-cancellable .item-checkbox,
          .already-cancelled .item-checkbox {
            display: none;
          }
          
          .checkbox-wrapper-46 input[type="checkbox"] {
            display: none;
            visibility: hidden;
          }

          .checkbox-wrapper-46 .cbx {
            margin: auto;
            -webkit-user-select: none;
            user-select: none;
            cursor: pointer;
          }
          .checkbox-wrapper-46 .cbx span {
            display: inline-block;
            vertical-align: middle;
            transform: translate3d(0, 0, 0);
          }
          .checkbox-wrapper-46 .cbx span:first-child {
            position: relative;
            width: 18px;
            height: 18px;
            border-radius: 3px;
            transform: scale(1);
            vertical-align: middle;
            border: 1px solid #9098A9;
            transition: all 0.2s ease;
          }
          .checkbox-wrapper-46 .cbx span:first-child svg {
            position: absolute;
            top: 3px;
            left: 2px;
            fill: none;
            stroke: #FFFFFF;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-dasharray: 16px;
            stroke-dashoffset: 16px;
            transition: all 0.3s ease;
            transition-delay: 0.1s;
            transform: translate3d(0, 0, 0);
          }
          .checkbox-wrapper-46 .cbx span:first-child:before {
            content: "";
            width: 100%;
            height: 100%;
            background: ${theme.primary};
            display: block;
            transform: scale(0);
            opacity: 1;
            border-radius: 50%;
          }
          .checkbox-wrapper-46 .cbx:hover span:first-child {
            border-color: ${theme.primary};
          }

          .checkbox-wrapper-46 .inp-cbx:checked + .cbx span:first-child {
            background: ${theme.primary};
            border-color: ${theme.primary};
            animation: wave-46 0.4s ease;
          }
          .checkbox-wrapper-46 .inp-cbx:checked + .cbx span:first-child svg {
            stroke-dashoffset: 0;
          }
          .checkbox-wrapper-46 .inp-cbx:checked + .cbx span:first-child:before {
            transform: scale(3.5);
            opacity: 0;
            transition: all 0.6s ease;
          }

          @keyframes wave-46 {
            50% {
              transform: scale(0.9);
            }
          }
          .cancel-reason {
            margin-top: 10px;
            display: none;
            width: 100%;
            position: relative;
          }
          
          .cancel-reason input {
            width: 100%;
            padding: 8px;
            border: 1px solid ${theme.border};
            border-radius: 4px;
            font-size: 12px;
            box-sizing: border-box;
          }
          
          .cancel-reason input:focus {
            border-color: ${theme.primary};
            outline: none;
          }
          
          .cancel-reason::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${theme.primary};
            display: block;
            transform: scale(0);
            opacity: 0.2;
            border-radius: 4px;
          }
          
          .cancel-reason.pulse::before {
            animation: reason-wave 0.6s ease;
          }

          @keyframes reason-wave {
            50% {
              transform: scale(1.02);
              opacity: 0.1;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }

          .button-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .submit-button, .cancel-order-button {
            display: block;
            width: 100%;
            font-family: Arial, sans-serif;
            background-size: 220%;
            box-shadow: 0 .2em .3em rgba(0, 0, 0, 0.15);
            color: ${theme.primary};
            background-color: transparent;
            background-position: 100%;
            border: 1px solid ${theme.primary};
            padding: 8px 16px;
            border-radius: 3px;
            transition: all .2s ease-out;
            font-weight: 900;
            cursor: pointer;
            background-image: linear-gradient(110deg, ${theme.primary} 0%, ${theme.primary} 50%, transparent 50%, transparent 100%);
            font-size: 14px;
          }
          .submit-button:hover, .cancel-order-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 .3em rgba(0, 0, 0, 0.25);
            background-position: 0;
            color: #fff;
          }
          .submit-button:active, .cancel-order-button:active {
            transform: translateY(-1px);
          }
          .item-quantity {
            font-weight: normal;
          }
          .return-button {
            margin-top: 8px;
            padding: 4px 12px;
            font-size: 12px;
            color: ${theme.primary};
            background: transparent;
            border: 1px solid ${theme.primary};
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .return-button:hover {
            background: ${theme.primary};
            color: white;
          }
          .selection-counter {
            margin-bottom: 10px;
            font-size: 14px;
            color: #666;
          }
        </style>
        <div class="item-cancellation-container">
          <div class="item-cancellation-title">Select Items to Cancel & Refund</div>
          <div class="order-number">Order Number: ${order_no}</div>
          <div class="selection-counter"></div>
          ${items
            .map((item, index) => {
              const isAlreadyCancelled = refundedOrderIds.includes(item.id);
              const nonCancellableStatus = item.status !== "Unfulfilled";
              const statusClass = isAlreadyCancelled
                ? "already-cancelled"
                : nonCancellableStatus
                ? "non-cancellable"
                : "";

              return `
                  <div class="cancellation-item ${statusClass}">
                    <div class="item-content">
                      <div class="item-image" style="background-image: url('${
                        item.imageUrl || defaultImageURL
                      }');"></div>
                      <div class="item-details">
                        <div class="item-name">${
                          item.name
                        } <span class="item-quantity">(x${
                item.quantity
              })</span></div>
                        <div class="item-status">
                          ${
                            isAlreadyCancelled
                              ? "Item already cancelled"
                              : nonCancellableStatus
                              ? `Cannot cancel - '${item.status}'`
                              : `Status: '${item.status}'` || ""
                          }
                        </div>
                        <div class="item-price">${item.currency} ${Number(
                item.price
              ).toFixed(2)}</div>
                        ${
                          nonCancellableStatus
                            ? `<button class="return-button" data-product-id="${item.product_id}">Start Returns Process</button>`
                            : ""
                        }
                      </div>
                      <div class="item-checkbox">
                          <div class="checkbox-wrapper-46">
                            <input class="inp-cbx" id="cbx-${index}" type="checkbox" />
                            <label class="cbx" for="cbx-${index}">
                              <span>
                                <svg width="12px" height="10px" viewbox="0 0 12 10">
                                  <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                                </svg>
                              </span>
                            </label>
                          </div>
                        </div>
                    </div>
                    <div class="cancel-reason" id="cancel-reason-${index}">
                      <input type="text" placeholder="Optional: provide a reason for cancelling">
                    </div>
                  </div>
                `;
            })
            .join("")}
          <div class="button-container">
            <button class="submit-button">Cancel Selected Items</button>
            <button class="cancel-order-button">Cancel Entire Order</button>
          </div>
        </div>
      `;

    const checkboxes = cancelItemContainer.querySelectorAll(".inp-cbx");
    const cancelReasons =
      cancelItemContainer.querySelectorAll(".cancel-reason");
    const submitButton = cancelItemContainer.querySelector(".submit-button");
    const cancelOrderButton = cancelItemContainer.querySelector(
      ".cancel-order-button"
    );
    const returnButtons =
      cancelItemContainer.querySelectorAll(".return-button");
    const selectionCounter =
      cancelItemContainer.querySelector(".selection-counter");

    const handleReasonKeydown = (event, currentIndex) => {
      if (event.key === "Enter") {
        event.preventDefault();

        const currentReason = event.target.closest(".cancel-reason");
        currentReason.classList.add("pulse");
        setTimeout(() => currentReason.classList.remove("pulse"), 600);

        const availableInputs = Array.from(cancelReasons)
          .filter((reason) => reason.style.display === "block")
          .map((reason) => reason.querySelector("input"));

        const currentInputIndex = availableInputs.indexOf(event.target);

        if (currentInputIndex === availableInputs.length - 1) {
          // Try multiple possible container selectors
          const chatContainer =
            document.querySelector(".vf-chat-container") ||
            document.querySelector(".chat-container") ||
            document.querySelector('[class*="chat"]') ||
            element.closest('[class*="chat"]');

          if (chatContainer) {
            setTimeout(() => {
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 100);
          } else {
            // Fallback: scroll the window
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
          }
        } else if (currentInputIndex < availableInputs.length - 1) {
          availableInputs[currentInputIndex + 1].focus();
        }
      }
    };

    // Add event listeners for reason inputs
    cancelReasons.forEach((reasonDiv, index) => {
      const input = reasonDiv.querySelector("input");
      input.addEventListener("keydown", (e) => handleReasonKeydown(e, index));
    });

    const updateSelectionInfo = () => {
      const selectedCount = Array.from(checkboxes).filter(
        (checkbox) => checkbox.checked
      ).length;
      selectionCounter.textContent = `${selectedCount} item${
        selectedCount !== 1 ? "s" : ""
      } selected`;
    };

    checkboxes.forEach((checkbox, index) => {
      checkbox.addEventListener("change", () => {
        cancelReasons[index].style.display = checkbox.checked
          ? "block"
          : "none";
        updateSelectionInfo();
      });
    });

    returnButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (hasSubmitted) return; // Prevent multiple submissions
        hasSubmitted = true;
        window.voiceflow.chat.interact({
          type: "return",
          payload: { product_id: button.dataset.productId },
        });
      });
    });

    submitButton.addEventListener("click", () => {
      if (hasSubmitted) return; // Prevent multiple submissions

      const selectedItems = Array.from(checkboxes)
        .map((checkbox, index) => {
          if (checkbox.checked && items[index].status === "Unfulfilled") {
            const reasonInput = cancelReasons[index].querySelector("input");
            return {
              ...items[index],
              selected: true,
              reason: reasonInput.value.trim() || null,
            };
          }
          return null;
        })
        .filter(Boolean);

      if (selectedItems.length > 0) {
        cancelItemContainer.classList.add("disabled");
        const inputs = cancelItemContainer.querySelectorAll("input, button");
        inputs.forEach((input) => (input.disabled = true));

        hasSubmitted = true;

        window.voiceflow.chat.interact({
          type: "cancel_selected",
          payload: { selectedItems: selectedItems },
        });
      }
    });

    cancelOrderButton.addEventListener("click", () => {
      if (hasSubmitted) return; // Prevent multiple submissions

      const allCancellableItems = items
        .filter((item) => item.status === "Unfulfilled")
        .map((item) => ({
          ...item,
          selected: true,
          reason: null,
        }));

      cancelItemContainer.classList.add("disabled");
      const inputs = cancelItemContainer.querySelectorAll("input, button");
      inputs.forEach((input) => (input.disabled = true));

      hasSubmitted = true;

      window.voiceflow.chat.interact({
        type: "cancel_all",
        payload: { selectedItems: allCancellableItems },
      });
    });

    updateSelectionInfo();
    element.appendChild(cancelItemContainer);
  },
};

const ReturnEvaluationExtension = {
  name: "ReturnEvaluation",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_returnEvaluation" ||
    trace.payload?.name === "ext_returnEvaluation",
  render: ({ trace, element }) => {
    removePreviousChatElements(".item-tracking-container", ".item-return-container", ".item-cancellation-container", ".return-eval-container");

    const theme = window.GrawThemeManager.getTheme();
    try {
      const { eligible_items = [], ineligible_items = [] } =
        trace.payload || {};
      let hasSubmitted = false;

      if (!Array.isArray(eligible_items) || !Array.isArray(ineligible_items)) {
        GrawLogger.error(
          "Error: eligible_items or ineligible_items is not an array."
        );
        const errorMessage =
          "Error: eligible_items or ineligible_items is not an array.";

        window.voiceflow.chat.interact({
          type: "error",
          payload: { errorMessage: errorMessage },
        });
      }

      if (eligible_items.length === 0 && ineligible_items.length === 0) {
        GrawLogger.warn("Warning: No items found for return evaluation.");
        element.innerHTML = `
          <div style="font-family: Arial, sans-serif; color: #d93025;">
            No items are available for return evaluation. Please try again later.
          </div>
        `;

        window.voiceflow.chat.interact({
          type: "error",
          payload: { errorMessage: errorMessage },
        });
      }

      const allItems = [...eligible_items, ...ineligible_items];
      const returnEvalContainer = document.createElement("div");

      returnEvalContainer.innerHTML = `
          <style>
            .vfrc-message--extension-ReturnEvaluation {
              background-color: transparent !important;
              background: none !important;
            }
            .return-eval-container {
              font-family: Arial, sans-serif;
              max-width: 400px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid ${theme.border};
              border-radius: 8px;
              background-color: #fff;
            }
            .return-eval-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .return-item {
              display: flex;
              flex-direction: column;
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid ${theme.border};
              transition: background-color 0.2s ease;
              border-radius: 8px;
              padding: 10px;
            }
            .return-item:hover {
              background-color: rgba(0, 0, 0, 0.02);
            }
            .return-item:last-child {
              border-bottom: none;
            }
            .item-header {
              display: flex;
              align-items: flex-start;
              cursor: pointer;
            }
            .item-image {
              width: 130px;
              height: 50px;
              object-fit: cover;
              border-radius: 8%;
              margin-right: 15px;
            }
            .item-info {
              flex-grow: 1;
            }
            .item-title {
              font-weight: bold;
              margin-bottom: 5px;
              font-size: 14px;
            }
            .item-price {
              color: #666;
              font-size: 14px;
              font-weight: bold;
            }
            .eligibility-tag {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              margin-top: 5px;
              display: inline-block;
            }
            .eligibility-tag.eligible {
              background-color: #e6f4ea;
              color: #1e8e3e;
            }
            .eligibility-tag.uncertain {
              background-color: #fef7e0;
              color: #b06000;
            }
            .eligibility-tag.ineligible {
              background-color: #fde7e9;
              color: #d93025;
            }
            .item-details {
              display: none;
              padding: 10px;
              margin-top: 10px;
              background-color: #f8f9fa;
              border-radius: 4px;
              font-size: 14px;
            }
            .item-details.expanded {
              display: block;
            }
            .detail-row {
              margin-bottom: 10px;
            }
            .detail-label {
              font-weight: 500;
              margin-bottom: 5px;
              display: flex;
              align-items: center;
              font-size: 12px;
              color: #666;
            }
            .detail-content {
              color: #444;
              line-height: 1.4;
              font-size: 12px;
            }
            .additional-details textarea {
              width: 100%;
              font-family: Arial, sans-serif;
              min-height: 60px;
              padding: 8px;
              border: 1px solid ${theme.border};
              border-radius: 4px;
              resize: vertical;
              font-size: 12px;
              margin-top: 5px;
            }
            .char-counter {
              font-size: 11px;
              color: #666;
              text-align: right;
              margin-top: 2px;
            }
            .button-container {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .submit-button, .cancel-button {
              display: block;
              width: 100%;
              font-family: Arial, sans-serif;
              background-size: 220%;
              box-shadow: 0 .2em .3em rgba(0, 0, 0, 0.15);
              color: ${theme.primary};
              background-color: transparent;
              background-position: 100%;
              border: 1px solid ${theme.primary};
              padding: 8px 16px;
              border-radius: 3px;
              transition: all .2s ease-out;
              font-weight: 900;
              cursor: pointer;
              background-image: linear-gradient(110deg, ${theme.primary} 0%, ${theme.primary} 50%, transparent 50%, transparent 100%);
              font-size: 14px;
            }
            .submit-button:hover, .cancel-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 0 .3em rgba(0, 0, 0, 0.25);
              background-position: 0;
              color: #fff;
            }
            .tooltip {
              position: absolute;
              background: #333;
              color: white;
              padding: 8px 12px;
              border-radius: 4px;
              font-size: 11px;
              z-index: 1000;
              max-width: 200px;
              pointer-events: none;
              opacity: 0;
              transition: opacity 0.2s ease;
            }
            .click-instruction {
              color: #666;
              font-size: 12px;
              margin-bottom: 15px;
              text-align: center;
            }
            .detail-label {
              font-weight: bold !important;
              margin-bottom: 8px !important;
            }
            .detail-content {
              font-style: italic;
              color: #444;
            }
            .info-text {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin: 15px 0;
              font-weight: bold !important;
            }
            .cancel-button {
              border-color: ${theme.cancel} !important;
              color: ${theme.cancel} !important;
              background-image: linear-gradient(110deg, ${theme.cancel} 0%, ${theme.cancel} 50%, transparent 50%, transparent 100%) !important;
            }
            .cancel-button:hover {
              color: #fff !important;
            }
          </style>
            <div class="return-eval-container">
              <div class="return-eval-title">Return Request Submission</div>
              ${
                allItems.length > 1
                  ? '<p class="click-instruction">Click items below to view details and provide additional information</p>'
                  : ""
              }
              ${allItems
                .map((item, index) => {
                  const eligibilityClass =
                    item.is_eligible === "item eligible"
                      ? "eligible"
                      : item.is_eligible === "item eligibility uncertain"
                      ? "uncertain"
                      : "ineligible";

                  const eligibilityText =
                    item.is_eligible === "item eligible"
                      ? "May be eligible for return"
                      : item.is_eligible === "item eligibility uncertain"
                      ? "Additional review needed"
                      : "Not eligible for return";

                  return `
                  <div class="return-item" data-item-id="${item.product_id}">
                    <div class="item-header" ${
                      allItems.length > 1
                        ? `onclick="this.nextElementSibling.classList.toggle('expanded')"`
                        : ""
                    }>
                      <img class="item-image" src="${item.imageUrl}" alt="${
                    item.name
                  }">
                      <div class="item-info">
                        <div class="item-title">${item.name}</div>
                        <div class="item-price">${item.currency} ${Number(
                    item.price
                  ).toFixed(2)}</div>
                        <span class="eligibility-tag ${eligibilityClass}">${eligibilityText}</span>
                      </div>
                    </div>
                    <div class="item-details ${
                      allItems.length === 1 ? "expanded" : ""
                    }">
                      <div class="detail-row">
                        <div class="detail-label">Provided Return Reason:</div>
                        <div class="detail-content">"${item.reason}"</div>
                      </div>
                      <div class="detail-row">
                        <div class="detail-label">Initial Evaluation:</div>
                        <div class="detail-content">${item.ai_evaluation}</div>
                      </div>
                      <div class="additional-details">
                        <div class="detail-label">Additional Details:</div>
                        <textarea 
                          placeholder="Optional: Add additional details (e.g., 'Item has visible wear on the sides' or 'Package was damaged during delivery')"
                          maxlength="500"
                          data-item-id="${item.product_id}"
                        ></textarea>
                        <div class="char-counter">0/500</div>
                      </div>
                    </div>
                  </div>
                `;
                })
                .join("")}
              <div class="info-text">Your request will be reviewed by our support team.</div>
              <div class="button-container">
                <button class="submit-button">Submit for Review</button>
                <button class="cancel-button">Cancel</button>
              </div>
            </div>
          `;

      // Add event listeners
      const container = returnEvalContainer.querySelector(
        ".return-eval-container"
      );

      // Tooltip functionality
      container.addEventListener("mouseover", (e) => {
        const infoIcon = e.target.closest(".info-icon");
        if (infoIcon) {
          const tooltip = document.createElement("div");
          tooltip.className = "tooltip";
          tooltip.textContent = infoIcon.dataset.tooltip;

          const rect = infoIcon.getBoundingClientRect();
          tooltip.style.top = `${rect.top - 30}px`;
          tooltip.style.left = `${rect.left + rect.width / 2 - 125}px`;

          document.body.appendChild(tooltip);
          setTimeout(() => (tooltip.style.opacity = "1"), 10);
        }
      });

      container.addEventListener("mouseout", (e) => {
        if (e.target.closest(".info-icon")) {
          const tooltips = document.querySelectorAll(".tooltip");
          tooltips.forEach((tooltip) => {
            tooltip.style.opacity = "0";
            setTimeout(() => tooltip.remove(), 200);
          });
        }
      });

      // Character counter for textareas
      const textareas = container.querySelectorAll("textarea");
      textareas.forEach((textarea) => {
        textarea.addEventListener("input", (e) => {
          const counter = e.target.nextElementSibling;
          counter.textContent = `${e.target.value.length}/500`;
        });
      });

      // Submit button handler
      const submitButton = container.querySelector(".submit-button");
      submitButton.addEventListener("click", () => {
        if (hasSubmitted) return;

        const returnData = allItems.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          is_eligible: item.is_eligible,
          reason: item.reason,
          ai_evaluation: item.ai_evaluation,
          additional_details: container
            .querySelector(`textarea[data-item-id="${item.product_id}"]`)
            .value.trim(),
        }));

        hasSubmitted = true;

        window.voiceflow.chat.interact({
          type: "return_evaluation_complete",
          payload: { returnData },
        });
      });

      // Cancel button handler
      const cancelButton = container.querySelector(".cancel-button");
      cancelButton.addEventListener("click", () => {
        if (hasSubmitted) return;
        hasSubmitted = true;
        window.voiceflow.chat.interact({
          type: "return_evaluation_cancelled",
          payload: { cancelled: true },
        });
      });

      element.appendChild(returnEvalContainer);
    } catch (error) {
      GrawLogger.error("An error occurred in ReturnEvaluationExtension:", error);
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #d93025;">
          An error occurred while processing your return evaluation. Please try again later.
        </div>
      `;

      window.voiceflow.chat.interact({
        type: "error",
        payload: {
          errorMessage:
            "An error occurred while processing your return evaluation. Please try again later.",
        },
      });
    }
  },
};

const ReturnItemExtension = {
  name: "ReturnItem",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_returnItem" || trace.payload?.name === "ext_returnItem",
  render: ({ trace, element }) => {
    removePreviousChatElements(".item-tracking-container", ".item-return-container", ".item-cancellation-container", ".return-eval-container");

    const theme = window.GrawThemeManager.getTheme();
    const {
      order_no,
      order_processed_date,
      shipping_address,
      items,
      refundedOrderIds = [],
    } = trace.payload;
    let hasSubmitted = false;

    const defaultImageURL =
      "https://e7.pngegg.com/pngimages/829/733/png-clipart-logo-brand-product-trademark-font-not-found-logo-brand-thumbnail.png";

    const returnItemContainer = document.createElement("div");

    returnItemContainer.innerHTML = `
        <style>
          .vfrc-message--extension-ReturnItem {
            background-color: transparent !important;
            background: none !important;
          }
          .item-return-container {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid ${theme.border};
            border-radius: 8px;
            background-color: #fff;
          }
          .item-return-container.disabled {
            pointer-events: none;
            opacity: 0.6;
          }
          .item-return-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .order-number {
            font-size: 14px;
            margin-bottom: 20px;
          }
          .return-item {
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid ${theme.border};
            transition: background-color 0.2s ease;
            border-radius: 8px;
            padding: 10px;
          }
          .return-item:hover {
            background-color: rgba(0, 0, 0, 0.02);
          }
          .return-item.non-returnable {
            opacity: 0.85;
          }
          .return-item.already-cancelled .item-name,
          .return-item.already-cancelled .item-quantity {
            text-decoration: line-through;
            color: #666;
          }
          .return-item:last-child {
            border-bottom: none;
          }
          .item-content {
            display: flex;
            align-items: flex-start;
          }
          .item-image {
            width: 130px;
            height: 50px;
            background-color: #fff;
            margin-right: 15px;
            background-size: cover;
            background-position: center;
            border-radius: 8%;
            object-fit: cover;
          }
          .item-details {
            flex-grow: 1;
          }
          .item-name {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .item-price, .item-status {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .non-returnable .item-status,
          .already-cancelled .item-status {
            color: ${theme.primary};
            font-weight: bold;
          }
          .already-cancelled .item-status {
            color: #9CA3AF !important;
          }
          .item-price {
            font-weight: bold;
          }
          .item-checkbox {
            margin-left: 10px;
            margin-top: 5px;
          }
          .non-returnable .item-checkbox,
          .already-cancelled .item-checkbox {
            display: none;
          }
          
          .checkbox-wrapper-46 input[type="checkbox"] {
            display: none;
            visibility: hidden;
          }

          .checkbox-wrapper-46 .cbx {
            margin: auto;
            -webkit-user-select: none;
            user-select: none;
            cursor: pointer;
          }
          .checkbox-wrapper-46 .cbx span {
            display: inline-block;
            vertical-align: middle;
            transform: translate3d(0, 0, 0);
          }
          .checkbox-wrapper-46 .cbx span:first-child {
            position: relative;
            width: 18px;
            height: 18px;
            border-radius: 3px;
            transform: scale(1);
            vertical-align: middle;
            border: 1px solid #9098A9;
            transition: all 0.2s ease;
          }
          .checkbox-wrapper-46 .cbx span:first-child svg {
            position: absolute;
            top: 3px;
            left: 2px;
            fill: none;
            stroke: #FFFFFF;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-dasharray: 16px;
            stroke-dashoffset: 16px;
            transition: all 0.3s ease;
            transition-delay: 0.1s;
            transform: translate3d(0, 0, 0);
          }
          .checkbox-wrapper-46 .cbx span:first-child:before {
            content: "";
            width: 100%;
            height: 100%;
            background: ${theme.primary};
            display: block;
            transform: scale(0);
            opacity: 1;
            border-radius: 50%;
          }
          .checkbox-wrapper-46 .cbx:hover span:first-child {
            border-color: ${theme.primary};
          }

          .checkbox-wrapper-46 .inp-cbx:checked + .cbx span:first-child {
            background: ${theme.primary};
            border-color: ${theme.primary};
            animation: wave-46 0.4s ease;
          }
          .checkbox-wrapper-46 .inp-cbx:checked + .cbx span:first-child svg {
            stroke-dashoffset: 0;
          }
          .checkbox-wrapper-46 .inp-cbx:checked + .cbx span:first-child:before {
            transform: scale(3.5);
            opacity: 0;
            transition: all 0.6s ease;
          }

          @keyframes wave-46 {
            50% {
              transform: scale(0.9);
            }
          }
          .return-reason {
            margin-top: 10px;
            display: none;
            width: 100%;
          }
          .return-reason select,
          .return-reason input[type="text"] {
            width: 100%;
            padding: 8px;
            border: 1px solid ${theme.border};
            border-radius: 4px;
            font-size: 12px;
            box-sizing: border-box;
          }
          .return-reason select:focus,
          .return-reason input[type="text"]:focus {
            border-color: ${theme.primary};
            outline: none;
          }
          .return-reason.error select,
          .return-reason.error input[type="text"] {
            border-color: #FB6573;
          }
          .additional-details-toggle {
            font-size: 12px;
            color: #666;
            background: none;
            border: none;
            padding: 5px 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            margin-top: 10px;
          }
          .additional-details-toggle:hover {
            color: ${theme.primary};
          }
          .additional-details {
            display: none;
            padding: 10px;
            margin-top: 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
            font-size: 14px;
            margin: 0 auto;
            max-width: 100%;
          }
          .additional-details.expanded {
            display: block;
          }
          .detail-row {
            margin-bottom: 10px;
          }
          .detail-label {
            font-weight: 500;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            font-size: 12px;
            color: #666;
          }
          .detail-content {
            color: #444;
            line-height: 1.4;
            font-size: 12px;
          }
          .additional-details textarea {
            width: 100%;
            min-height: 80px;
            padding: 6px;
            border: 1px solid ${theme.border};
            border-radius: 1px;
            resize: vertical;
            font-size: 12px;
            margin-top: 5px;
            margin: 0 auto;
          }
          .additional-details textarea::placeholder {
            font-family: Arial, sans-serif;
          }
          .char-counter {
            font-size: 11px;
            color: #666;
            text-align: right;
            margin-top: 2px;
          }
          .button-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .submit-button, .cancel-button {
              display: block;
              width: 100%;
              font-family: Arial, sans-serif;
              background-size: 220%;
              box-shadow: 0 .2em .3em rgba(0, 0, 0, 0.15);
              color: ${theme.primary};
              background-color: transparent;
              background-position: 100%;
              border: 1px solid ${theme.primary};
              padding: 8px 16px;
              border-radius: 3px;
              transition: all .2s ease-out;
              font-weight: 900;
              cursor: pointer;
              background-image: linear-gradient(110deg, ${theme.primary} 0%, ${theme.primary} 50%, transparent 50%, transparent 100%);
              font-size: 14px;
          }
          .cancel-button {
              border-color: ${theme.cancel} !important;
              color: ${theme.cancel} !important;
              background-image: linear-gradient(110deg, ${theme.cancel} 0%, ${theme.cancel} 50%, transparent 50%, transparent 100%) !important;
          }
          .cancel-button:hover {
              color: #fff !important;
          }
          .submit-button:hover, .cancel-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 0 .3em rgba(0, 0, 0, 0.25);
              background-position: 0;
              color: #fff;
          }
          .submit-button:active, .cancel-button:active {
              transform: translateY(-1px);
          }

          .cancel-refund-button {
              margin-top: 8px;
              padding: 4px 12px;
              font-size: 12px;
              color: ${theme.primary};
              background: transparent;
              border: 1px solid ${theme.primary};
              border-radius: 3px;
              cursor: pointer;
              transition: all 0.2s;
          }
          .cancel-refund-button:hover {
              background: ${theme.primary};
              color: white;
          }
          .selection-counter {
              margin-bottom: 10px;
              font-size: 14px;
              color: #666;
          }
          .tooltip {
            position: absolute;
            background: #FB6573;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            max-width: 200px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: opacity 0.3s ease;
            pointer-events: none;
          }
          .tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            border: 6px solid transparent;
            border-top-color: #FB6573;
            transform: translateX(-50%);
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        </style>
        <div class="item-return-container">
          <div class="item-return-title">Return Request Form</div>
          <div class="order-number">Order Number: ${order_no}</div>
          <div class="selection-counter"></div>
          ${items
            .map((item, index) => {
              const isAlreadyCancelled = refundedOrderIds.includes(item.id);
              const isUnfulfilled = item.status === "Unfulfilled";
              const statusClass = isAlreadyCancelled
                ? "already-cancelled"
                : isUnfulfilled
                ? "non-returnable"
                : "";

              return `
                  <div class="return-item ${statusClass}">
                    <div class="item-content">
                      <div class="item-image" style="background-image: url('${
                        item.imageUrl || defaultImageURL
                      }');"></div>
                      <div class="item-details">
                        <div class="item-name">${
                          item.name
                        } <span class="item-quantity">(x${
                item.quantity
              })</span></div>
                        <div class="item-status">
                          ${
                            isAlreadyCancelled
                              ? "Item already cancelled"
                              : isUnfulfilled
                              ? `<span class="item-status" style="color: ${theme.primary}; font-style: italic;">Item not yet fulfilled, click to cancel/refund</span>`
                              : `Status: '${item.status}'`
                          }
                        </div>
                        <div class="item-price">${item.currency} ${Number(
                item.price
              ).toFixed(2)}</div>
                        ${
                          isUnfulfilled && !isAlreadyCancelled
                            ? `<button class="cancel-refund-button" data-product-id="${item.product_id}">Cancel/Refund Item</button>`
                            : ""
                        }
                      </div>
                      <div class="item-checkbox">
                        <div class="checkbox-wrapper-46">
                          <input class="inp-cbx" id="cbx-${index}" type="checkbox" />
                          <label class="cbx" for="cbx-${index}">
                            <span>
                              <svg width="12px" height="10px" viewbox="0 0 12 10">
                                <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                              </svg>
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div class="return-reason" id="return-reason-${index}">
                      <select class="return-reason-select">
                        <option value="">Select a reason for return...</option>
                        <option value="damaged">Item arrived damaged</option>
                        <option value="defective">Item is defective</option>
                        <option value="wrong_item">Received wrong item</option>
                        <option value="not_as_described">Item not as described</option>
                        <option value="size_issue">Size/fit issue</option>
                        <option value="quality_issue">Quality not as expected</option>
                        <option value="changed_mind">Changed mind</option>
                        <option value="other">Other (please specify)</option>
                      </select>
                      <input type="text" class="other-reason" style="display: none; margin-top: 5px;" placeholder="Please specify your reason...">
                    </div>
                      <button class="additional-details-toggle" style="display: none;">Provide Additional Details ▼</button>
                    <div class="additional-details">
                      <div class="detail-row">
                        <textarea placeholder="Optional: Add additional details (e.g., 'Item has visible wear on the sides' or 'Package was damaged during delivery')" maxlength="500"></textarea>
                        <div class="char-counter">0/500</div>
                      </div>
                    </div>
                  </div>
                `;
            })
            .join("")}
          <div class="button-container">
            <button class="submit-button">Submit</button>
            <button class="cancel-button">Cancel</button>
          </div>
        </div>
      `;

    const checkboxes = returnItemContainer.querySelectorAll(".inp-cbx");
    const returnReasons =
      returnItemContainer.querySelectorAll(".return-reason");
    const submitButton = returnItemContainer.querySelector(".submit-button");
    const cancelButton = returnItemContainer.querySelector(".cancel-button");
    const cancelRefundButtons = returnItemContainer.querySelectorAll(
      ".cancel-refund-button"
    );
    const selectionCounter =
      returnItemContainer.querySelector(".selection-counter");
    const additionalDetailsToggles = returnItemContainer.querySelectorAll(
      ".additional-details-toggle"
    );
    const textareas = returnItemContainer.querySelectorAll("textarea");

    // Setup character counters
    textareas.forEach((textarea) => {
      const counter = textarea.nextElementSibling;
      textarea.addEventListener("input", () => {
        counter.textContent = `${textarea.value.length}/500`;
      });
    });

    // Setup additional details toggles
    additionalDetailsToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const details = toggle.nextElementSibling;
        const isExpanded = details.classList.contains("expanded");
        details.classList.toggle("expanded");
        toggle.textContent = `Provide Additional Details ${
          isExpanded ? "▼" : "▲"
        }`;
      });
    });

    // Setup return reason dropdowns
    returnItemContainer
      .querySelectorAll(".return-reason-select")
      .forEach((select) => {
        select.addEventListener("change", (e) => {
          const otherInput = e.target.nextElementSibling;
          if (e.target.value === "other") {
            otherInput.style.display = "block";
            otherInput.focus();
          } else {
            otherInput.style.display = "none";
            otherInput.value = "";
          }
        });
      });

    const updateSelectionInfo = () => {
      const selectedCount = Array.from(checkboxes).filter(
        (checkbox) => checkbox.checked
      ).length;
      selectionCounter.textContent = `${selectedCount} item${
        selectedCount !== 1 ? "s" : ""
      } selected`;
    };

    const showTooltip = (message, element) => {
      const existingTooltip = returnItemContainer.querySelector(".tooltip");
      if (existingTooltip) existingTooltip.remove();
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.textContent = message;
      returnItemContainer.appendChild(tooltip);
      const rect = element.getBoundingClientRect();
      const containerRect = returnItemContainer.getBoundingClientRect();
      const top = rect.top - containerRect.top + element.offsetHeight + 8;
      const left =
        rect.left - containerRect.left + (rect.width - tooltip.offsetWidth) / 2;
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
      tooltip.style.opacity = "0";
      tooltip.style.transition = "opacity 0.3s ease";
      setTimeout(() => {
        tooltip.style.opacity = "1";
      }, 10);
      setTimeout(() => {
        tooltip.remove();
      }, 3000);
    };

    checkboxes.forEach((checkbox, index) => {
      checkbox.addEventListener("change", () => {
        returnReasons[index].style.display = checkbox.checked
          ? "block"
          : "none";
        const toggleButton = returnReasons[index].nextElementSibling;
        const additionalDetails = toggleButton.nextElementSibling;
        toggleButton.style.display = checkbox.checked ? "block" : "none";
        if (!checkbox.checked) {
          additionalDetails.classList.remove("expanded");
          toggleButton.textContent = "Provide Additional Details ▼";
        }
        updateSelectionInfo();
      });
    });

    cancelRefundButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (hasSubmitted) return; // Prevent multiple submissions
        hasSubmitted = true;
        window.voiceflow.chat.interact({
          type: "cancel_refund",
          payload: { product_id: button.dataset.productId },
        });
      });
    });

    submitButton.addEventListener("click", () => {
      if (hasSubmitted) return;

      const selectedItems = Array.from(checkboxes)
        .map((checkbox, index) => {
          if (checkbox.checked) {
            const reasonSelect = returnReasons[index].querySelector("select");
            const otherReasonInput =
              returnReasons[index].querySelector(".other-reason");
            const additionalDetails = returnReasons[
              index
            ].nextElementSibling.nextElementSibling
              .querySelector("textarea")
              .value.trim();

            const selectedReason = reasonSelect.value;
            const reason =
              selectedReason === "other"
                ? otherReasonInput.value.trim()
                : selectedReason;

            if (!reason) {
              reasonSelect.classList.add("error");
              if (selectedReason === "other") {
                otherReasonInput.classList.add("error");
              }
              return null;
            }

            reasonSelect.classList.remove("error");
            otherReasonInput.classList.remove("error");

            return {
              ...items[index],
              selected: true,
              reason: reason,
              additionalDetails: additionalDetails || null,
            };
          }
          return null;
        })
        .filter(Boolean);

      const selectedCount = Array.from(checkboxes).filter(
        (checkbox) => checkbox.checked
      ).length;

      if (selectedCount === 0) {
        showTooltip("Please select at least one item to return", submitButton);
        return;
      }

      // Check if we have all required information for selected items
      const hasAllInfo = selectedItems.length === selectedCount;

      if (!hasAllInfo) {
        showTooltip(
          "Please provide a return reason for all selected items",
          submitButton
        );
        return;
      }

      // Create comprehensive return request payload
      const currentDate = new Date();
      const returnRequestPayload = {
        requestInfo: {
          orderNumber: order_no,
          shipping_address: shipping_address,
          requestDate: currentDate.toISOString(),
          requestTimestamp: currentDate.getTime(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          order_processed_date: order_processed_date,
        },
        returnItems: selectedItems.map((item) => ({
          productId: item.product_id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          currency: item.currency,
          returnReason: item.reason,
          additionalDetails: item.additionalDetails,
          imageUrl: item.imageUrl || defaultImageURL,
          tracking_company: item.tracking_company,
          product_weight: item.product_weight,
          sku: item.sku,
          inventory_quantity: item.inventory_quantity,
        })),
        totalItems: selectedItems.length,
      };

      // Continue with submission
      returnItemContainer.classList.add("disabled");
      const inputs = returnItemContainer.querySelectorAll("input, button");
      inputs.forEach((input) => (input.disabled = true));

      hasSubmitted = true;

      window.voiceflow.chat.interact({
        type: "return_selected",
        payload: {
          returnRequest: returnRequestPayload,
        },
      });
    });

    cancelButton.addEventListener("click", () => {
      if (hasSubmitted) return; // Prevent multiple submissions
      hasSubmitted = true;
      window.voiceflow.chat.interact({
        type: "cancel_return",
        payload: { cancelled: true },
      });
    });

    updateSelectionInfo();
    element.appendChild(returnItemContainer);
  },
};

// Extension for displaying proactive messages
const ProactiveMessagesExtension = {
  name: "ProactiveMessages",
  type: "effect",

  match: ({ trace }) =>
    trace.type === "ext_proactiveMessages" ||
    trace.payload?.name === "ext_proactiveMessages",

  effect: async ({ trace }) => {
    try {
      GrawLogger.log("Received proactive messages trace:", trace);

      const userId = UserIdentifier.getUserId();
      if (!userId) {
        GrawLogger.error("No user ID available, cannot check conversation state");
        return;
      }

      // Check conversation state before proceeding
      let { isConversationOngoing, fallbackUsed } = await ConversationStateManager.checkConversationState(userId);

      const isWidgetOpen = ConversationStateManager.isWidgetOpen();

      if (fallbackUsed){
          GrawLogger.log("Fallback used, assuming not ongoing");
          isConversationOngoing = false;
      }

      if (isConversationOngoing || isWidgetOpen) {
        GrawLogger.log("Conversation is ongoing or widget is open - skipping proactive messages");
        return;
      }

      window.voiceflow.chat.proactive.clear();

      let messages;
      try {
        const payloadData =
          typeof trace.payload === "string"
            ? JSON.parse(trace.payload)
            : trace.payload;

        messages = payloadData.proactive_messages;

        if (!Array.isArray(messages)) {
          throw new Error("Proactive messages must be an array");
        }
      } catch (parseError) {
        GrawLogger.error(
          "Failed to parse proactive messages payload:",
          parseError
        );
        return;
      }

      if (!messages || messages.length === 0) {
        GrawLogger.warn("No valid proactive messages found in payload");
        return;
      }

      let currentDelay = 0;
      messages.forEach((messageObj, index) => {
        if (!messageObj.message) {
          GrawLogger.warn(`Skipping invalid message at index ${index}`);
          return;
        }

        const messageDelay = messageObj.delay || index * 2000;
        currentDelay += messageDelay;

        setTimeout(async () => {
          try {
            window.voiceflow.chat.proactive.push({
              type: "text",
              payload: {
                message: messageObj.message,
                style: messageObj.style || {},
              },
            });
          } catch (pushError) {
            GrawLogger.error(
              `Failed to push proactive message ${index + 1}:`,
              pushError
            );
          }
        }, currentDelay);
      });
    } catch (error) {
      GrawLogger.error("Error in ProactiveMessagesExtension:", error);
    }
  },
};



const CustomerDataExtension = {
  name: "CustomerData",
  type: "effect",
  match: ({ trace }) =>
    trace.type === "ext_customerData" ||
    trace.payload?.name === "ext_customerData",

  effect: ({ trace }) => {
    try {
      // Log incoming trace for debugging
      GrawLogger.log("Received customer data trace:", trace);

      // Check if customer data exists and customer is logged in
      if (window.customerData && window.customerData.customer) {
        const customerData = window.customerData.customer;
        GrawLogger.log("Working: ", customerData);

        // Send successful response with customer data
        window.voiceflow.chat.interact({
          type: "customer_data_response",
          payload: {
            isLoggedIn: true,
            email: customerData.email,
            customerId: customerData.id,
            name: customerData.name,
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            acceptsMarketing: customerData.acceptsMarketing,
          },
        });
      } else {
        // Handle case where customer is not logged in
        window.voiceflow.chat.interact({
          type: "customer_data_not_avail",
          payload: {
            isLoggedIn: false,
            totalOrders: 0,
            totalSpent: 0,
          },
        });
      }
    } catch (error) {
      GrawLogger.error("Error in CustomerDataExtension:", error);

      // Send error response to Voiceflow
      window.voiceflow.chat.interact({
        type: "customer_data_not_avail",
        payload: {
          error: "Failed to process customer data",
          isLoggedIn: false,
        },
      });
    }
  },
};

const KlaviyoDataExtension = {
  name: "KlaviyoInfoExtension",
  type: "effect",
  match: ({ trace }) => 
    trace.type === "ext_getKlaviyoData" || 
    trace.payload?.name === "ext_getKlaviyoData",

  effect: ({ trace }) => {
    try {  
      const payloadData = 
        typeof trace.payload === "string" 
          ? JSON.parse(trace.payload) 
          : trace.payload;
  
      // Store customer type and eligibility
      sessionStorage.setItem('klaviyoCustomerType', payloadData.customerType);
      sessionStorage.setItem('isKlaviyoEligible', 
        JSON.stringify(payloadData.customerType !== 'ACTIVE_CUSTOMER'));

      GrawLogger.log('Klaviyo email: ', payloadData.email)
      GrawLogger.log('Klaviyo customer type set:', payloadData.customerType);
      
      // Fire event for other scripts to capture Klaviyo data
      window.dispatchEvent(new CustomEvent('klaviyoDataReceived', {
        detail: {
          email: payloadData.email,
          customerId: payloadData.customerId,
          klaviyoProfileId: payloadData.klaviyoProfileId,
          customerType: payloadData.customerType,
          isSubscribed: payloadData.isSubscribed
        }
      }));
    } catch (error) {
      GrawLogger.error("Error in GiftCardEligibilityExtension:", error);
    }
  }
};

const AddToCartExtension = {
  name: "AddToCart",
  type: "effect",
  match: ({ trace }) =>
    trace.type === "ext_addToCart" ||
    trace.payload?.name === "ext_addToCart",

  effect: ({ trace }) => {
    try {
      // Parse payload if it's a string
      let payload = trace.payload;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (parseError) {
          GrawLogger.error("Failed to parse payload:", parseError);
          window.voiceflow.chat.interact({
            type: "add_to_cart_error",
            payload: {
              success: false,
              error: "Invalid payload format"
            }
          });
          return;
        }
      }

      // Log incoming trace for debugging
      GrawLogger.log("Received add to cart trace:", payload);

      // Extract variant_id and quantity from payload
      const variantId = payload.variant_id;
      const quantity = payload.quantity || 1; // Default to 1 if not specified

      if (!variantId) {
        GrawLogger.error("No variant_id provided in payload");
        window.voiceflow.chat.interact({
          type: "add_to_cart_error",
          payload: {
            success: false,
            error: "No variant ID provided"
          }
        });
        return;
      }

      // Add to cart using Shopify AJAX API
      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: variantId,
            quantity: quantity
          }]
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        GrawLogger.log("Successfully added to cart:", data);
        window.voiceflow.chat.interact({
          type: "success",
          payload: {
            success: true,
          }
        });
        
        // Refresh mini cart if it exists
        if (typeof window.refreshCart === 'function') {
          window.refreshCart();
        }

        // Optional: Trigger cart drawer to open if it exists
        if (typeof window.openCartDrawer === 'function') {
          window.openCartDrawer();
        }
      })
      .catch(error => {
        GrawLogger.error("Error adding to cart:", error);
        window.voiceflow.chat.interact({
          type: "add_to_cart_error",
          payload: {
            success: false,
            error: error.message
          }
        });
      });

    } catch (error) {
      GrawLogger.error("Error in AddToCartExtension:", error);
      window.voiceflow.chat.interact({
        type: "add_to_cart_error",
        payload: {
          success: false,
          error: "Failed to process add to cart request"
        }
      });
    }
  }
};

const CheckoutExtension = {
  name: "ProgrammaticCheckout",
  type: "effect",
  match: ({ trace }) =>
    trace.type === "ext_initiateCheckout" ||
    trace.payload?.name === "ext_initiateCheckout",

  effect: ({ trace }) => {
    try {
      // Check if cart is empty
      fetch('/cart.js', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch cart contents');
        }
        return response.json();
      })
      .then(cartData => {
        // Check if cart is empty
        if (cartData.item_count === 0) {
          GrawLogger.warn("Cannot proceed to checkout - cart is empty");
          window.voiceflow.chat.interact({
            type: "checkout_error",
            payload: {
              success: false,
              error: "Cart is empty"
            }
          });
          return;
        }

        // Redirect directly to checkout
        window.location.href = '/cart/checkout';
        
        // Send success response to Voiceflow
        window.voiceflow.chat.interact({
          type: "checkout_success",
          payload: {
            success: true,
            cartData: JSON.stringify(cartData),
            itemCount: cartData.item_count,
            total: cartData.total_price
          }
        });
      })
      .catch(error => {
        GrawLogger.error("Checkout error:", error);
        window.voiceflow.chat.interact({
          type: "checkout_error",
          payload: {
            success: false,
            error: "Failed to initiate checkout"
          }
        });
      });
    } catch (error) {
      GrawLogger.error("Error in CheckoutExtension:", error);
      window.voiceflow.chat.interact({
        type: "checkout_error",
        payload: {
          success: false,
          error: "Unexpected error during checkout"
        }
      });
    }
  }
};

const PlaceholderExtension = {
  name: "Placeholder",
  type: "effect",
  match: ({ trace }) =>
    trace.type === "ext_placeholder" || trace.payload?.name === "ext_placeholder",
  effect: ({ trace }) => {
    const chatDiv = document.getElementById("voiceflow-chat");
    const shadowRoot = chatDiv.shadowRoot;
    const textarea = shadowRoot.querySelector("textarea");
    textarea.placeholder = trace.payload.placeholder;
  },
};

const AbandonedCartExtension = {
  name: "AbandonedCart",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_abandonedCart" ||
    trace.payload?.name === "ext_abandonedCart",
  render: ({ trace, element }) => {
    removePreviousChatElements(".abandoned-cart-container");

    const { items, CTA_label, customerId, checkoutId, recoveryURL, totalPrice, currency } = trace.payload;
    const defaultImageURL = "";
    const theme = window.GrawThemeManager.getTheme();

    const abandonedCartContainer = document.createElement("div");
    abandonedCartContainer.innerHTML = `
        <style>         
          .vfrc-message--extension-AbandonedCart {
            background-color: transparent !important;
            background: none !important;
          }
          .abandoned-cart-container {
            font-family: 'Rubik', Arial, sans-serif;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid ${theme.border};
            border-radius: 8px;
            background-color: #fff;
          }
          .abandoned-cart-title {
            font-size: 16px;
            text-align: center;
            margin-bottom: 10px;
            letter-spacing: 1px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(128, 128, 128, 0.2);
            color: ${theme.primary};
            font-style: oblique;
            font-weight: bold;
          }
          .cart-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(128, 128, 128, 0.2);
          }
          .cart-item:last-child {
            border-bottom: none;
          }
          .cart-total {
            text-align: center;
            margin-bottom: 20px;
            font-size: 11px;
            color: grey;
            font-weight: 400;
            font-style: italic;
          }
          .item-image {
            width: 130px;
            height: 130px;
            background-color: #fff;
            margin-bottom: 10px;
            background-size: cover;
            background-position: center;
            border-radius: 8%;
            object-fit: cover;
          }
          .item-name {
            text-align: center;
            margin-top: 16px;
            font-size: small;
            color: grey;
          }
          .submit-button {
            display: block;
            width: 100%;
            font-family: Arial, sans-serif;
            background-size: 220%;
            box-shadow: 0 .2em .3em rgba(0, 0, 0, 0.15);
            color: ${theme.primary};
            background-color: transparent;
            background-position: 100%;
            border: 1px solid ${theme.primary};
            padding: 8px 16px;
            border-radius: 3px;
            transition: all .2s ease-out;
            font-weight: 900;
            cursor: pointer;
            background-image: linear-gradient(110deg, ${theme.primary} 0%, ${theme.primary} 50%, transparent 50%, transparent 100%);
            font-size: 14px;
          }
          .submit-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 .3em rgba(0, 0, 0, 0.25);
            background-position: 0;
            color: #fff;
          }
          .submit-button:active {
            transform: translateY(-1px);
          }
        </style>
        <div class="abandoned-cart-container">
          <div class="abandoned-cart-title">Good News:<br>We Saved Your Picks</div>
          <div class="cart-total">Total: ${totalPrice} ${currency}</div>
          ${items
            .map(
              (item) => `
                <div class="cart-item">
                  <div class="item-image" style="background-image: url('${
                    item.imageUrl || defaultImageURL
                  }');"></div>
                    <div class="item-name">${item.name}${item.quantity && item.quantity != "1" ? ` (x${item.quantity})` : ''}</div>
                </div>
              `
            )
            .join("")}
          <button class="submit-button" data-recovery-url="${recoveryURL}">${CTA_label}</button>
        </div>
      `;

    const submitButton = abandonedCartContainer.querySelector(".submit-button");
    
    submitButton.addEventListener("click", () => {
      // Send interaction event to Voiceflow
      const recoveryURL = submitButton.getAttribute('data-recovery-url');
      window.voiceflow.chat.interact({
        type: "submitted"
      });
      // Navigate to recovery URL
      //if (recoveryURL) {
      //  window.location.href = recoveryURL;
      //}
    
    });

    element.appendChild(abandonedCartContainer);
  },
};

const ClearProactiveExtension = {
  name: "ClearProactiveMessages",
  type: "effect",
  match: ({ trace }) =>
    trace.type === "ext_clearproactive" ||
    trace.payload?.name === "ext_clearproactive",

  effect: ({ trace }) => {
    // Add a small delay to ensure the vf object is fully loaded
    setTimeout(() => {
      try {
        if (window.voiceflow && window.voiceflow.chat && window.voiceflow.chat.proactive) {
          window.voiceflow.chat.proactive.clear();
        }
      } catch (error) {
        // Silent error handling
      }
    }, 100);
  },
};


const GoCheckoutExtension = {
  name: "GoToCheckout",
  type: "effect",
  match: ({ trace }) =>
    trace.type === "ext_checkout" ||
    trace.payload?.name === "ext_checkout",

  effect: ({ trace }) => {

    const { recoveryURL } = trace.payload;
    // Add a small delay to ensure the voiceflow object is fully loaded
    try {
      // Navigate to recovery URL
      if (recoveryURL) {
        window.location.href =  recoveryURL;
      }
    } catch (error) {
      // Silent error handling
    }
  },
};


const ContactFormExtension = {
  name: "ContactForm",
  type: "response",
  match: ({ trace }) =>
    trace.type === "ext_contactForm" ||
    trace.payload?.name === "ext_contactForm",
  render: ({ trace, element }) => {
    // Remove any previous contact form elements to avoid duplicates
    removePreviousChatElements(".contact-form-container");

    const { title = "Contact Us", buttonText = "Send Message" } = trace.payload || {};
    const theme = window.GrawThemeManager.getTheme();

    const contactFormContainer = document.createElement("div");
    contactFormContainer.innerHTML = `
        <style>         
          .vfrc-message--extension-ContactForm {
            background-color: transparent !important;
            background: none !important;
          }
          .contact-form-container {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid ${theme.border};
            border-radius: 8px;
            background-color: #fff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .contact-form-title {
            font-size: 18px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 16px;
            color: ${theme.primary};
          }
          .form-group {
            margin-bottom: 16px;
          }
          .form-label {
            display: block;
            font-size: 14px;
            margin-bottom: 6px;
            color: ${theme.text};
          }
          .form-input {
            width: 100%;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
            font-size: 14px;
            transition: all 0.3s ease;
            font-family: Arial, sans-serif;
          }
          .form-input:focus {
            outline: none;
            border-color: ${theme.primary};
            box-shadow: 0 0 0 2px rgba(75, 187, 222, 0.2);
          }
          .form-textarea {
            width: 100%;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
            font-size: 14px;
            resize: vertical;
            min-height: 100px;
            transition: all 0.3s ease;
            font-family: Arial, sans-serif;
          }
          .form-textarea:focus {
            outline: none;
            border-color: ${theme.primary};
            box-shadow: 0 0 0 2px rgba(75, 187, 222, 0.2);
          }
          .submit-button {
            display: block;
            width: 100%;
            font-family: Arial, sans-serif;
            background-size: 220%;
            box-shadow: 0 .2em .3em rgba(0, 0, 0, 0.15);
            color: ${theme.primary};
            background-color: transparent;
            background-position: 100%;
            border: 1px solid ${theme.primary};
            padding: 10px 16px;
            border-radius: 6px;
            transition: all .2s ease-out;
            font-weight: 600;
            cursor: pointer;
            background-image: linear-gradient(110deg, ${theme.primary} 0%, ${theme.primary} 50%, transparent 50%, transparent 100%);
            font-size: 14px;
          }
          .submit-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 .3em rgba(0, 0, 0, 0.25);
            background-position: 0;
            color: #fff;
          }
          .submit-button:active {
            transform: translateY(-1px);
          }
          .error-message {
            color: #B93333;
            font-size: 12px;
            margin-top: 4px;
            display: none;
          }
        </style>
        <div class="contact-form-container">
          <div class="contact-form-title">${title}</div>
          <form id="contact-form">
            <div class="form-group">
              <label class="form-label" for="name">Your Name</label>
              <input
                class="form-input"
                id="name"
                name="name"
                placeholder="Enter your name"
                type="text"
                required
              />
              <div class="error-message" id="name-error">Please enter your name</div>
            </div>
            <div class="form-group">
              <label class="form-label" for="email">Your Email</label>
              <input
                class="form-input"
                id="email"
                name="email"
                placeholder="Enter your email"
                type="email"
                required
              />
              <div class="error-message" id="email-error">Please enter a valid email</div>
            </div>
            <div class="form-group">
              <label class="form-label" for="message">Your Message</label>
              <textarea
                class="form-textarea"
                id="message"
                name="message"
                placeholder="How can we help you?"
                rows="4"
                required
              ></textarea>
              <div class="error-message" id="message-error">Please enter your message</div>
            </div>
            <button
              class="submit-button"
              type="submit"
              id="contact-submit"
            >
              ${buttonText}
            </button>
          </form>
        </div>
      `;

    // Form validation and submission handling
    const form = contactFormContainer.querySelector("#contact-form");
    
    form.addEventListener("submit", (e) => {
      GrawLogger.log("Form submitted");
      e.preventDefault();
      
      // Get form values
      const name = form.querySelector("#name").value.trim();
      const email = form.querySelector("#email").value.trim();
      const message = form.querySelector("#message").value.trim();
      
      // Validate form
      let isValid = true;
      
      // Use the contactFormContainer to scope the selectors
      const nameError = contactFormContainer.querySelector("#name-error");
      const emailError = contactFormContainer.querySelector("#email-error");
      const messageError = contactFormContainer.querySelector("#message-error");
      
      if (!name) {
        nameError.style.display = "block";
        isValid = false;
      } else {
        nameError.style.display = "none";
      }
      
      if (!email || !isValidEmail(email)) {
        emailError.style.display = "block";
        isValid = false;
      } else {
        emailError.style.display = "none";
      }
      
      if (!message) {
        messageError.style.display = "block";
        isValid = false;
      } else {
        messageError.style.display = "none";
      }
      
      if (isValid) {
        // Prepare the data to send back to Voiceflow
        const formData = {
          name,
          email,
          message,
          timestamp: new Date().toISOString()
        };
        
        // Send the form data to Voiceflow
        window.voiceflow.chat.interact({
          type: "contactFormSubmitted",
          payload: {
            formData: JSON.stringify(formData)
          }
        });
        
        // Optional: Show a success message or reset the form
        form.reset();
        
        // Remove the contact form after submission
        const contactFormElement = contactFormContainer.querySelector(".contact-form-container");
        if (contactFormElement) {
          contactFormElement.innerHTML = `
            <div style="text-align: center; padding: 20px;">
              <p style="color: ${theme.primary}; font-weight: bold;">Thank you! We'll be in touch soon.</p>
            </div>
          `;
        }
      }
    });
    
    // Helper function to validate email format
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    element.appendChild(contactFormContainer);
  },
};