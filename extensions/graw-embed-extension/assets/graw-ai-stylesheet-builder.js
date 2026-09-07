// assets/graw-ai-stylesheet-builder.js (Conceptual - Integrating Palette & New Styles)
const GrawAIStylesheetBuilder = {
    // ... (color conversion functions: _hexToRgb, _rgbToHsl, _hslToRgb, _rgbToHex - ensure these are robust) ...
    // Example _lightnessSteps (tweak as needed to match desired palette aesthetic):
    _lightnessSteps: [95, 88, 80, 70, 60, 52, 44, 36, 28, 20], // Lighter to Darker (0-100 scale)

    _hexToRgb: function(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) { // #RGB
            r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) { // #RRGGBB
            r = parseInt(hex[1] + hex[2], 16); g = parseInt(hex[3] + hex[4], 16); b = parseInt(hex[5] + hex[6], 16);
        } else { return null; } // Invalid hex
        return { r, g, b };
    },
    _rgbToHsl: function(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; } // achromatic
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 }; // h in degrees, s/l in percentage
    },
    _hslToRgb: function(h, s, l) {
        s /= 100; l /= 100; h /= 360;
        let r, g, b;
        if (s === 0) { r = g = b = l; } // achromatic
        else {
            const hueToRgb = (p, q, t) => {
                if (t < 0) t += 1; if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hueToRgb(p, q, h + 1/3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1/3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },
    _rgbToHex: function(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    },

    generatePalette: function(baseHexInput) {
        GrawLogger.log("GRAW AI StylesheetBuilder: generatePalette called with baseHex:", baseHexInput);
        window.GRAW_AI_GENERATED_PALETTE = null;
        if (!baseHexInput || baseHexInput.toLowerCase() === 'transparent' || baseHexInput.length < 4 || baseHexInput === "#00000000" || baseHexInput === "#0000") {
            GrawLogger.log("GRAW AI StylesheetBuilder: No valid baseHex for palette generation.");
            return null;
        }
        const baseRgb = this._hexToRgb(baseHexInput);
        if (!baseRgb) { GrawLogger.error("GRAW AI StylesheetBuilder: Failed to convert baseHex to RGB:", baseHexInput); return null; }
        const baseHsl = this._rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
        const palette = [];
        for (const lStep of this._lightnessSteps) {
            const currentS = baseHsl.s; // Could adjust saturation for extremes if desired
            const newHsl = { h: baseHsl.h, s: currentS, l: lStep };
            const newRgb = this._hslToRgb(newHsl.h, newHsl.s, newHsl.l);
            palette.push(this._rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        }
        window.GRAW_AI_GENERATED_PALETTE = palette;
        GrawLogger.log("GRAW AI StylesheetBuilder: Generated GRAW palette:", palette);
        return palette;
    },

    _getLiveVoiceflowShade: function(shadeIndex) { // Generalized helper
        let vfShade = null;
        if (typeof shadeIndex !== 'number' || shadeIndex < 0 || shadeIndex > 9) return null;
        try {
            const vfHost = document.querySelector("#voiceflow-chat");
            if (vfHost) {
                const targets = [vfHost, vfHost.shadowRoot?.querySelector('._1xyscpy0'), vfHost.shadowRoot?.querySelector('.vfrc-widget')].filter(Boolean);
                for (const el of targets) {
                    if (el && typeof getComputedStyle === 'function') {
                        const styleVal = getComputedStyle(el).getPropertyValue(`--_1bof89n${shadeIndex}`).trim();
                        if (styleVal) {
                            vfShade = styleVal;
                            break;
                        }
                    }
                }
            }
        } catch (e) { /* mute */ }
        return vfShade;
    },

    buildCssString: function(settings) {
        GrawLogger.log("GRAW AI StylesheetBuilder: buildCssString called with settings:", JSON.parse(JSON.stringify(settings)));
        let widgetCssFallback = `
            /* --- Begin widget.css fallback styles --- */
            [class*="vfrc-message--extension-Feedback"] {
                padding: 0px !important;
                background-color: transparent !important;
                margin-top: 4px !important;
            }
            /* --- End widget.css fallback styles --- */
            `;
        
        // 1. Determine primary color for GRAW Extensions
        let extensionPrimaryColor = "#4BBBDE"; // Ultimate fallback
        const grawGeneratedPalette = this.generatePalette(settings.chatBaseColor); // This also sets window.GRAW_AI_GENERATED_PALETTE
        const hasCustomPalette = grawGeneratedPalette && grawGeneratedPalette.length > 5;

        if (hasCustomPalette) {
            extensionPrimaryColor = grawGeneratedPalette[5];
            GrawLogger.log("GRAW AI StylesheetBuilder: Using GRAW generated palette shade 5 for extensions:", extensionPrimaryColor);
        } else {
            const liveVfShade5 = this._getLiveVoiceflowShade(5);
            if (liveVfShade5) {
                extensionPrimaryColor = liveVfShade5;
                GrawLogger.log("GRAW AI StylesheetBuilder: Using live Voiceflow shade 5 for extensions:", extensionPrimaryColor);
            } else {
                GrawLogger.log("GRAW AI StylesheetBuilder: Using hardcoded fallback for extensions color.");
            }
        }

        let cssString = "";

        // 2. Root variables for extensions (always include these)
        let cssRootVarsForExtensions = ":root {\n";
        cssRootVarsForExtensions += `    --primaryColor: ${extensionPrimaryColor} !important; /* For your var(--primaryColor) */\n`;
        
        // Define other colors for extensions, potentially from the palette or as fixed values
        if (window.GRAW_AI_GENERATED_PALETTE && window.GRAW_AI_GENERATED_PALETTE.length === 10) {
            const p = window.GRAW_AI_GENERATED_PALETTE;
            cssRootVarsForExtensions += `    --secondaryColor: ${p[4]} !important; /* Lighter than primary */\n`;
            cssRootVarsForExtensions += `    --borderColor: ${p[2]} !important; /* A light border from palette */\n`;
            cssRootVarsForExtensions += `    --textColor: ${p[8]} !important; /* Dark text from palette */\n`;
            cssRootVarsForExtensions += `    --cancelColor: #8388A4 !important; /* A mid-light shade for cancel */\n`;
            cssRootVarsForExtensions += `    --hoverColor: ${p[0]} !important; /* Very light for hover text or bg */\n`;
            cssRootVarsForExtensions += `    --negativeColor: #D9534F !important; /* Fixed negative color or from palette */\n`;
        } else {
            // Fallbacks if no GRAW palette was generated (e.g., using Voiceflow's default theme)
            const liveVfBorder = this._getLiveVoiceflowShade(2);
            const liveVfText = this._getLiveVoiceflowShade(8);
            cssRootVarsForExtensions += `    --secondaryColor: #3aafd1 !important;\n`;
            cssRootVarsForExtensions += `    --borderColor: ${liveVfBorder || '#DDDDDD'} !important;\n`;
            cssRootVarsForExtensions += `    --textColor: ${liveVfText || '#333333'} !important;\n`;
            cssRootVarsForExtensions += `    --cancelColor: #8388A4 !important;\n`;
            cssRootVarsForExtensions += `    --hoverColor: #FFFFFF !important;\n`;
            cssRootVarsForExtensions += `    --negativeColor: #B93333 !important;\n`;
        }
        cssRootVarsForExtensions += "}\n";
        
        cssString = widgetCssFallback + "\n" + cssRootVarsForExtensions;

        // 3. Add Voiceflow Palette Variables if a custom palette was generated by GRAW
        if (hasCustomPalette) {
            cssString += `
                :host(#voiceflow-chat), /* Target the shadow host */
                #voiceflow-chat,
                .vfrc-widget, /* Common Voiceflow widget class, often host or main wrapper */
                ._1xyscpy0 { /* Specific inner container identified from user HTML */
            `;
            grawGeneratedPalette.forEach((color, index) => {
                cssString += `    --_1bof89n${index}: ${color} !important;\n`;
            });
            cssString += `}\n`;
            GrawLogger.log("GRAW AI StylesheetBuilder: Custom Voiceflow palette CSS generated.");
        } else {
            GrawLogger.log("GRAW AI StylesheetBuilder: No custom GRAW palette generated for Voiceflow (--_1bof89n vars). Voiceflow will use its own default palette.");
        }

        // 4. Add Launcher Text Style - STATE-AWARE LOGIC
        if (settings.launcherText && settings.launcherText.trim() !== "") {
            const escapedLauncherText = settings.launcherText.replace(/'/g, "\\'").replace(/"/g, '\\"');

            cssString += `
                /* --- Custom Launcher Text --- */
                /* Show custom text only when closed (media wrapper carries the "n" state class) */
                .vfrc-launcher--media[class*="f2qfspn"] ~ .vfrc-launcher__label {
                    font-size: 0 !important;
                    color: transparent !important;
                    line-height: 0 !important;
                }
                .vfrc-launcher--media[class*="f2qfspn"] ~ .vfrc-launcher__label::before {
                    content: "${escapedLauncherText}" !important;
                    font-size: 14px !important;
                    line-height: normal !important;
                    color: #FFFFFF !important;
                    display: inline-block !important;
                    vertical-align: middle !important;
                }
                /* Hide custom text completely when open (media wrapper carries the "m" state class) */
                .vfrc-launcher--media[class*="f2qfspm"] ~ .vfrc-launcher__label {
                    display: none !important;
                }
            `;

            GrawLogger.log("GRAW AI StylesheetBuilder: Launcher text CSS generated using stable vfrc-launcher__label/--media selectors.");
        }

        // 5. Add Custom Launcher Icon Style
        if (settings.launcherIconUrl && settings.launcherIconUrl.trim() !== "") {
            const escapedLauncherIconUrl = settings.launcherIconUrl.replace(/"/g, '\\"');
            cssString += `
                /* Closed state only: hide default icon image and the chevron, show custom icon as background */
                .vfrc-launcher--media[class*="f2qfspn"] > .vfrc-launcher--media-icon,
                .vfrc-launcher--media[class*="f2qfspn"] > .vfrc-launcher__chevron {
                    display: none !important;
                }
                .vfrc-launcher--media[class*="f2qfspn"] {
                    background-image: url("${escapedLauncherIconUrl}") !important;
                    background-size: contain !important;
                    background-position: center !important;
                    background-repeat: no-repeat !important;
                    width: 24px !important;
                    height: 24px !important;
                    border: none !important;
                    padding: 0 !important;
                    font-size: 0 !important;
                }
            `;
            GrawLogger.log("GRAW AI StylesheetBuilder: Custom launcher icon CSS (closed state) generated using stable vfrc-launcher--media selector.");
        }

        // 6. Add Chatbot Avatar Image Styles
        if (settings.chatAvatarUrl && settings.chatAvatarUrl.trim() !== "") {
            const escapedAvatarUrl = settings.chatAvatarUrl.replace(/"/g, '\\"');
            // Targeting avatar images based on provided HTML
            cssString += `
                .vfrc-header img.vfrc-avatar[class*="g931q1"] {
                    content: url("${escapedAvatarUrl}") !important; /* Preferred method if it works on img */
                    object-fit: cover !important; /* Ensure image scales nicely */
                    width: 36px !important; /* Header image size */
                    height: 36px !important;
                    box-sizing: border-box !important;
                }
                .vfrc-assistant-info img.vfrc-avatar[class*="g931q1"] {
                    content: url("${escapedAvatarUrl}") !important; /* Preferred method if it works on img */
                    object-fit: cover !important; /* Ensure image scales nicely */
                    width: 72px !important; /* Assistant info image size */
                    height: 72px !important;
                    box-sizing: border-box !important;
                    box-shadow: 0 0 0 1px #161a1e0f, 0 1px 1px #161a1e03, 0 4px 8px -18px #161a1e0a, 0 8px 12px -18px #161a1e0a, 0 10px 16px -18px #161a1e14, 0 12px 20px -18px #161a1e14, 0 16px 28px -18px #161a1e1f, 0 20px 44px -18px #161a1e1f;
                }
            `;
            // Fallback using ::after pseudo-element if `content: url()` on `<img>` is unreliable
            cssString += `
                .vfrc-header .vfrc-avatar[class*="g931q1"],
                .vfrc-assistant-info .vfrc-avatar[class*="g931q1"] {
                    /* This will apply if the 'content' rule above doesn't fully take over the img src */
                    /* For this to work, the original image needs to be hidden if it still shows */
                     /* font-size: 0; /* Technique to hide original image if it's an icon font or has text */
                     /* background: transparent !important; /* Hide original image */
                }
                .vfrc-header .vfrc-avatar[class*="g931q1"]::after,
                .vfrc-assistant-info .vfrc-avatar[class*="g931q1"]::after {
                    content: "" !important;
                    display: block !important;
                    position: absolute !important; /* Position it over the original img space */
                    top: 0; left: 0;
                    width: 100% !important; /* Take full space of the original img element */
                    height: 100% !important;
                    background-image: url("${escapedAvatarUrl}") !important;
                    background-size: cover !important;
                    background-position: center !important;
                    background-repeat: no-repeat !important;
                    border-radius: inherit !important; /* Inherit border radius from original img */
                }
            `;
            GrawLogger.log("GRAW AI StylesheetBuilder: Avatar CSS generated.");
        }
        
        GrawLogger.log("GRAW AI StylesheetBuilder: Final CSS string to be encoded:\n", cssString);
        return cssString.trim();
    },

    encodeStylesheetForVoiceflow: function(settings) {
        const cssToEncode = this.buildCssString(settings);
        if (cssToEncode && cssToEncode !== "") {
            try {
                const encoded = btoa(unescape(encodeURIComponent(cssToEncode)));
                const dataUri = `data:text/css;base64,${encoded}`;
                GrawLogger.log("GRAW AI StylesheetBuilder: Encoded Stylesheet URI (length " + dataUri.length + "):", dataUri.substring(0, 150) + "...");
                return dataUri;
            } catch (e) {
                GrawLogger.error("GRAW AI StylesheetBuilder: Error Base64 encoding stylesheet:", e);
                return "";
            }
        }
        GrawLogger.log("GRAW AI StylesheetBuilder: No custom CSS generated to encode.");
        return "";
    }
};