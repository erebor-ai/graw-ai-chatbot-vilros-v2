//assets/theme-manager.js
window.GrawThemeManager = {
    _themeColors: null,
    _initialized: false,

    // Initialize theme colors once when extensions are loaded
    init: function() {
        if (this._initialized) return;

        const initializeWithDelay = () => {
            GrawLogger.log("GrawThemeManager: Initializing theme colors");

            // Get base color from settings
            const baseColor = window.GRAW_AI_SETTINGS?.chatBaseColor;
            let themeColors = {};

            if (baseColor && baseColor !== '' && baseColor.toLowerCase() !== 'transparent' &&
                baseColor !== '#00000000' && baseColor !== '#0000' && baseColor !== 'rgba(0,0,0,0)') {

                // We have a custom base color - generate palette or use existing
                if (window.GRAW_AI_GENERATED_PALETTE && window.GRAW_AI_GENERATED_PALETTE.length === 10) {
                    const p = window.GRAW_AI_GENERATED_PALETTE;
                    themeColors = {
                        primary: p[5],           // Main primary color
                        primaryLight: p[3],      // Lighter variant
                        primaryDark: p[7],       // Darker variant
                        secondary: p[4],         // Secondary color
                        border: p[2],            // Light border
                        text: p[8],              // Dark text
                        textLight: p[1],         // Light text
                        background: p[0],        // Very light background
                        cancel: '#8388A4',       // Fixed cancel color
                        hover: p[0],             // Hover background
                        negative: '#D9534F',     // Error/negative color
                        success: '#28a745'       // Success color
                    };
                    GrawLogger.log("GrawThemeManager: Using GRAW generated palette");
                } else {
                    // Fallback - generate minimal palette from base color
                    themeColors = this._generateMinimalPalette(baseColor);
                    GrawLogger.log("GrawThemeManager: Generated minimal palette from base color");
                }
            } else {
                // No custom base color - try to get from live Voiceflow or use defaults
                themeColors = this._getLiveVoiceflowTheme() || this._getDefaultTheme();
                GrawLogger.log("GrawThemeManager: Using Voiceflow live theme or defaults");
            }

            this._themeColors = themeColors;
            this._initialized = true;

            GrawLogger.log("GrawThemeManager: Theme colors initialized:", themeColors);
        }
        // Add a small delay to allow the Voiceflow widget to fully render its styles
        setTimeout(initializeWithDelay, 100);
    },

    // Get theme colors (initialize if needed)
    getTheme: function() {
        if (!this._initialized) {
            return this.init();
        }
        return this._themeColors;
    },

    // Get specific color with fallback
    getColor: function(colorName, fallback = '#4BBBDE') {
        const theme = this.getTheme();
        return theme[colorName] || fallback;
    },

    // Generate CSS string for inline styles
    getCssString: function(colorName, fallback) {
        return this.getColor(colorName, fallback);
    },

    // Try to extract colors from live Voiceflow widget
    _getLiveVoiceflowTheme: function() {
        try {
            const vfHost = document.querySelector("#voiceflow-chat");
            if (!vfHost) return null;

            const targets = [
                vfHost, 
                vfHost.shadowRoot?.querySelector('._1xyscpy0'), 
                vfHost.shadowRoot?.querySelector('.vfrc-widget')
            ].filter(Boolean);

            const colors = {};
            const shadeMap = {
                primary: 5,
                primaryLight: 3,
                primaryDark: 7,
                secondary: 4,
                border: 2,
                text: 8,
                textLight: 1,
                background: 0
            };

            for (const [colorName, shadeIndex] of Object.entries(shadeMap)) {
                for (const el of targets) {
                    if (el && typeof getComputedStyle === 'function') {
                        const styleVal = getComputedStyle(el).getPropertyValue(`--_1bof89n${shadeIndex}`).trim();
                        if (styleVal) {
                            colors[colorName] = styleVal;
                            break;
                        }
                    }
                }
            }

            // Add fixed colors
            colors.cancel = '#8388A4';
            colors.negative = '#D9534F';
            colors.success = '#28a745';

            return Object.keys(colors).length > 0 ? colors : null;
        } catch (e) {
            GrawLogger.warn("GrawThemeManager: Error getting live Voiceflow theme:", e);
            return null;
        }
    },

    // Default theme fallback
    _getDefaultTheme: function() {
        return {
            primary: '#4BBBDE',
            primaryLight: '#7DCDEB',
            primaryDark: '#3A94B8',
            secondary: '#3aafd1',
            border: '#DDDDDD',
            text: '#333333',
            textLight: '#F5F5F5',
            background: '#FFFFFF',
            cancel: '#8388A4',
            hover: '#F8F9FA',
            negative: '#D9534F',
            success: '#28a745'
        };
    },

    // Generate minimal palette from single base color
    _generateMinimalPalette: function(baseColor) {
        // Use the existing color conversion functions from GrawAIStylesheetBuilder if available
        if (typeof GrawAIStylesheetBuilder !== 'undefined') {
            const palette = GrawAIStylesheetBuilder.generatePalette(baseColor);
            if (palette && palette.length === 10) {
                return {
                    primary: palette[5],
                    primaryLight: palette[3],
                    primaryDark: palette[7],
                    secondary: palette[4],
                    border: palette[2],
                    text: palette[8],
                    textLight: palette[1],
                    background: palette[0],
                    cancel: '#8388A4',
                    hover: palette[0],
                    negative: '#D9534F',
                    success: '#28a745'
                };
            }
        }
        
        // Simple fallback if palette generation fails
        return {
            primary: baseColor,
            primaryLight: baseColor,
            primaryDark: baseColor,
            secondary: baseColor,
            border: '#DDDDDD',
            text: '#333333',
            textLight: '#F5F5F5',
            background: '#FFFFFF',
            cancel: '#8388A4',
            hover: '#F8F9FA',
            negative: '#D9534F',
            success: '#28a745'
        };
    }
};