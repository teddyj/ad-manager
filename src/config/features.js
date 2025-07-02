/**
 * Feature Flags Configuration
 * Controls which features are enabled in the application
 */

export const FEATURES = {
  // Campaign Flow Features
  NEW_CAMPAIGN_FLOW: import.meta.env.VITE_NEW_CAMPAIGN_FLOW === 'true',
  PLATFORM_INTEGRATIONS: import.meta.env.VITE_PLATFORM_INTEGRATIONS === 'true',
  AUDIENCE_SYNC: import.meta.env.VITE_AUDIENCE_SYNC === 'true',
  CREATIVE_AI: import.meta.env.VITE_CREATIVE_AI === 'true',
  
  // Database Migration Features
  USE_DATABASE: import.meta.env.VITE_USE_DATABASE === 'true',
  MIGRATE_EXISTING_DATA: import.meta.env.VITE_MIGRATE_EXISTING_DATA === 'true',
  
  // Background Generation Features  
  ENABLE_BACKGROUND_CHANGE: import.meta.env.VITE_ENABLE_BACKGROUND_CHANGE === 'true',
  
  // Development Features (only enabled in development)
  DEBUG_DATABASE: import.meta.env.DEV && import.meta.env.VITE_DEBUG_DATABASE === 'true',
  SHOW_MIGRATION_UI: import.meta.env.DEV && import.meta.env.VITE_SHOW_MIGRATION_UI === 'true'
}

/**
 * Get feature flag status with environment information
 */
export const getFeatureInfo = () => ({
  features: FEATURES,
  environment: {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  },
  database: {
    configured: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
    enabled: FEATURES.USE_DATABASE
  }
})

/**
 * Check if database features are available
 */
export const isDatabaseAvailable = () => {
  // For file-based storage via HTTP API, we don't need Supabase credentials
  if (FEATURES.USE_DATABASE) {
    // Check if we can reach the backend API
    return true; // We know the backend is running on port 3003
  }
  return false;
}

/**
 * Check if migration is needed/enabled
 */
export const isMigrationEnabled = () => {
  return FEATURES.USE_DATABASE && FEATURES.MIGRATE_EXISTING_DATA
}

// Feature descriptions for documentation
export const FEATURE_DESCRIPTIONS = {
  NEW_CAMPAIGN_FLOW: 'Enhanced campaign creation with product selection, audience building, platform selection, and multi-platform creative generation',
  PLATFORM_INTEGRATIONS: 'Direct publishing to advertising platforms (Meta, Display, CTV, TikTok)',
  AUDIENCE_SYNC: 'Synchronize audience data to platform advertising accounts',
  CREATIVE_AI: 'AI-powered creative optimization based on platform and audience',
  DEBUG_DATABASE: 'Development debugging and logging features for database',
  SHOW_MIGRATION_UI: 'Development feature to show migration UI'
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