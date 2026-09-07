
(function(window) {
  'use strict';
  const GrawLogger = {
    /**
     * Checks if logging is enabled via the global settings.
     * @returns {boolean} True if logging is enabled, false otherwise.
     */
    _isLoggingEnabled: function() {
      // Default to false if settings are not available.
      return window.GRAW_AI_SETTINGS?.enableDebugLogging === true;
    },

    /**
     * Logs a standard message.
     * @param {...any} args - The arguments to log.
     */
    log: function(...args) {
      if (this._isLoggingEnabled()) {
        console.log(...args);
      }
    },

    /**
     * Logs a warning message.
     * @param {...any} args - The arguments to log as a warning.
     */
    warn: function(...args) {
      if (this._isLoggingEnabled()) {
        console.warn(...args);
      }
    },

    /**
     * Logs an error message.
     * @param {...any} args - The arguments to log as an error.
     */
    error: function(...args) {
      // Always log errors them regardless of the debug flag.
      // If you truly want to suppress everything, you can add the check back.
      console.error(...args);
    },

    /**
     * Logs an informational message.
     * @param {...any} args - The arguments to log as info.
     */
    info: function(...args) {
      if (this._isLoggingEnabled()) {
        console.info(...args);
      }
    },
  };

  // Expose the logger to the global window object.
  window.GrawLogger = GrawLogger;

})(window);