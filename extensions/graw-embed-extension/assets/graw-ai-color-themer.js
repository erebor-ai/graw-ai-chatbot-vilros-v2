const GrawAIColorThemer = {
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

    generatePalette: function(baseHex) {
        window.GRAW_AI_GENERATED_PALETTE = null;
        if (!baseHex || baseHex.toLowerCase() === 'transparent' || baseHex.length < 4 || baseHex === "#00000000" || baseHex === "#0000") {
            return null;
        }
        const baseRgb = this._hexToRgb(baseHex);
        if (!baseRgb) return null;
        const baseHsl = this._rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
        const palette = [];
        for (const lStep of this._lightnessSteps) {
            const currentS = baseHsl.s; // Consider adjusting saturation for very light/dark for aesthetics
            const newHsl = { h: baseHsl.h, s: currentS, l: lStep };
            const newRgb = this._hslToRgb(newHsl.h, newHsl.s, newHsl.l);
            palette.push(this._rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        }
        window.GRAW_AI_GENERATED_PALETTE = palette;
        return palette;
    },

    _findThemeableVoiceflowElements: function() {
        const elements = [];
        const voiceflowChatHost = document.querySelector("#voiceflow-chat"); // The host of the shadow DOM

        if (!voiceflowChatHost) {
            GrawLogger.warn("GRAW AI Color Themer: #voiceflow-chat host element not found.");
            return elements;
        }

        // Target 1: The Shadow DOM host itself, if it's the one getting `.vfrc-widget` and inline styles.
        // So, voiceflowChatHost (if it has these classes) or its direct children might be targets.
        // Let's check if the host itself has a class like 'vfrc-widget' or the obfuscated ones.
        if (voiceflowChatHost.matches && (voiceflowChatHost.matches('.vfrc-widget') || voiceflowChatHost.matches('.ck2fbe0'))) {
            elements.push(voiceflowChatHost);
        }

        // Target 2: Elements *inside* the shadow root.
        const shadowRoot = voiceflowChatHost.shadowRoot;
        if (shadowRoot) {
            // Your example: <div class="_1xyscpy0" style="--_1bof89n0: ...">
            const innerStyledElement = shadowRoot.querySelector('._1xyscpy0');
            if (innerStyledElement && !elements.includes(innerStyledElement)) {
                elements.push(innerStyledElement);
            }

            // Sometimes the main widget container *inside* the shadow DOM also gets these.
            const widgetContainerInShadow = shadowRoot.querySelector('.vfrc-widget'); // Or other relevant top-level container class inside shadow
            if (widgetContainerInShadow && !elements.includes(widgetContainerInShadow)) {
                elements.push(widgetContainerInShadow);
            }
        } else {
            GrawLogger.warn("GRAW AI Color Themer: #voiceflow-chat shadowRoot not found.");
        }

        if (elements.length === 0) {
            GrawLogger.warn("GRAW AI Color Themer: Could not find specific Voiceflow elements for inline styling. Will rely on :root CSS variables as fallback for GRAW extensions.");
        }
        return elements;
    },

    applyColorsToVoiceflowElements: function(baseHex) {
        const palette = this.generatePalette(baseHex); // Sets window.GRAW_AI_GENERATED_PALETTE
        const themeableElements = this._findThemeableVoiceflowElements();

        // Always try to clear any previously GRAW-injected inline styles from VF elements
        const clearInlineStyles = (el) => {
            for (let i = 0; i < 10; i++) { el.style.removeProperty(`--_1bof89n${i}`); }
            // el.style.removeProperty(`--_1bof89na`); // For font if applicable
        };
        themeableElements.forEach(clearInlineStyles);

        // Clear the :root injected style tag (for GRAW extensions)
        let rootStyleTag = document.getElementById('graw-ai-dynamic-root-theme');
        if (rootStyleTag) {
            rootStyleTag.remove();
            rootStyleTag = null; // Ensure it's recreated if needed
        }

        if (!palette) {
            GrawLogger.log('GRAW AI Color Themer: No valid base color. Voiceflow default theme will apply.');
            window.GRAW_AI_GENERATED_PALETTE = null; // Ensure it's cleared
            return; // Let Voiceflow's default apply by not setting anything
        }

        // Apply to specific Voiceflow elements found via their inline `style` attribute
        if (themeableElements.length > 0) {
            themeableElements.forEach(el => {
                palette.forEach((color, index) => {
                    el.style.setProperty(`--_1bof89n${index}`, color);
                });
                // Example for font, if it was also a CSS var:
                // el.style.setProperty(`--_1bof89na`, window.GRAW_AI_SETTINGS.fontFamily || "'Rubik'");
            });
            GrawLogger.log('GRAW AI Color Themer: Custom palette applied via inline styles to Voiceflow elements.');
        }

        // Set palette variables on :root for GRAW AI's own extensions' easy access
        // This is useful for your custom UI components.
        if (!rootStyleTag) {
            rootStyleTag = document.createElement('style');
            rootStyleTag.id = 'graw-ai-dynamic-root-theme';
            document.head.appendChild(rootStyleTag);
        }
        let css = ':root {\n';
        palette.forEach((color, index) => {
            // Using a GRAW-specific prefix for these root variables to avoid potential conflicts
            // and to clearly indicate they are for your extensions.
            css += `  --graw-palette-shade-${index}: ${color};\n`;
        });
        css += '}';
        rootStyleTag.textContent = css;
        GrawLogger.log('GRAW AI Color Themer: Palette variables set on :root for GRAW extensions.');
    }
};