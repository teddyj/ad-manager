/**
 * Feature Flag Configuration
 * Controls the availability of new features and flows
 */

export const FEATURES = {
  // New campaign flow with multi-platform support
  NEW_CAMPAIGN_FLOW: import.meta.env.VITE_NEW_CAMPAIGN_FLOW === 'true',
  
  // Platform integrations (Meta, Display, CTV, TikTok)
  PLATFORM_INTEGRATIONS: import.meta.env.VITE_PLATFORM_INTEGRATIONS === 'true',
  
  // Audience sync to platforms
  AUDIENCE_SYNC: import.meta.env.VITE_AUDIENCE_SYNC === 'true',
  
  // AI-powered creative optimization
  CREATIVE_AI: import.meta.env.VITE_CREATIVE_AI === 'true',
  
  // Debug mode for development
  DEBUG_MODE: import.meta.env.MODE === 'development'
};

// Feature descriptions for documentation
export const FEATURE_DESCRIPTIONS = {
  NEW_CAMPAIGN_FLOW: 'Enhanced campaign creation with product selection, audience building, platform selection, and multi-platform creative generation',
  PLATFORM_INTEGRATIONS: 'Direct publishing to advertising platforms (Meta, Display, CTV, TikTok)',
  AUDIENCE_SYNC: 'Synchronize audience data to platform advertising accounts',
  CREATIVE_AI: 'AI-powered creative optimization based on platform and audience',
  DEBUG_MODE: 'Development debugging and logging features'
};

// Check if feature is enabled with fallback
export const isFeatureEnabled = (featureName) => {
  return FEATURES[featureName] || false;
};

// Get all enabled features
export const getEnabledFeatures = () => {
  return Object.entries(FEATURES)
    .filter(([key, value]) => value)
    .map(([key]) => key);
};

// Development helper
if (FEATURES.DEBUG_MODE) {
  console.log('🚀 Enabled Features:', getEnabledFeatures());
} 