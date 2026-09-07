// app/config.server.ts

/**
 * ============================================================================
 * GRAW AI - CLIENT-SPECIFIC CONFIGURATION
 *
 * This file centralizes configuration constants that are specific to each client
 * or Voiceflow project. These values should be updated when setting up the app
 * for a new client.
 *
 * ============================================================================
 */

/**
 * Toggle to enable/disable background evaluations for conversation transcripts.
 * Set to `true` to enable, `false` to disable.
 * Disabling evaluations will prevent API calls to Voiceflow's evaluation endpoint
 * and display "Evaluation not available" in the UI.
 */
export const ENABLE_EVALUATIONS = true;

/**
 * Voiceflow Evaluation IDs. These are specific to your Voiceflow project's evaluations.
 * Update these IDs to match the evaluations configured in the Voiceflow dashboard.
 */
export const EVALUATION_IDS = {
  sentiment: '6a1466ed30cd9ea65e6f2161', // Customer sentiment evaluation ID
  // Add more evaluation IDs here as needed:
  // resolved: 'eval_resolved_xxx',
  // purchase_intent: 'eval_intent_xxx',
  // summary: 'eval_summary_xxx'
};

/**
 * Voiceflow Project-specific configuration.
 */
export const VOICEFLOW_CONFIG = {
  /**
   * The ID of the custom property in Voiceflow that indicates if a conversation
   * is considered a "real conversation" (e.g., has user messages, is not just a bot launch).
   * This ID is used to filter transcripts fetched from the Voiceflow API.
   * This value is unique per Voiceflow project.
   */
  real_convo_prop_id: '6a344e1edf2af6fe6842bb2c',
  production_environment_id: '6a1466e7d6967f015e3ae7e5',
};


/**
 * Date to start fetching analytics data from.
 * This value should be update when setting up the app for a new client.
 * The client will not see analytics data before this date.
 * Format: "YYYY-MM-DDTHH:mm:ss.SSSZ"
 */
export const ANALYTICS_START_DATE = '2026-06-26T00:00:00.000Z';
