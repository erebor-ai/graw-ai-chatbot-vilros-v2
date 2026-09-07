// app/voiceflow.server.ts
/**
 * Get Voiceflow API key from environment variables
 * This replaces the database lookup for better performance and cost efficiency
 */
export function getVoiceflowApiKey(): string | null {
  const apiKey = process.env.VOICEFLOW_API_KEY;
  
  if (!apiKey) {
    console.error('VOICEFLOW_API_KEY environment variable not found');
    return null;
  }
  
  return apiKey;
}

/**
 * Get Voiceflow project ID from environment variables
 */
export function getVoiceflowProjectId(): string | null {
  const projectId = process.env.VOICEFLOW_PROJECT_ID;
  
  if (!projectId) {
    console.error('VOICEFLOW_PROJECT_ID environment variable not found');
    return null;
  }
  
  return projectId;
}

/**
 * Validate that the API key is properly formatted
 */
export function validateVoiceflowApiKey(apiKey: string | null): boolean {
  if (!apiKey) return false;
  
  // Voiceflow API keys typically start with "VF.DM" and have a specific format
  return apiKey.startsWith('VF.') && apiKey.length > 10;
}

/**
 * Validate that the project ID is properly formatted
 */
export function validateVoiceflowProjectId(projectId: string | null): boolean {
  if (!projectId) return false;
  
  // Voiceflow project IDs are typically 24-character hex strings
  return /^[a-f0-9]{24}$/i.test(projectId);
}
