// Debug script to test campaign loading
import { legacyCompatibility } from './legacyCompatibility.js'
import { FEATURES, isDatabaseAvailable } from '../config/features.js'

export const debugCampaigns = async () => {
  console.log('🔍 DEBUG: Testing campaign loading...')
  
  try {
    // Check environment and features
    console.log('0. Environment Check:')
    console.log('   VITE_USE_DATABASE:', import.meta.env.VITE_USE_DATABASE)
    console.log('   FEATURES.USE_DATABASE:', FEATURES.USE_DATABASE)
    console.log('   isDatabaseAvailable():', isDatabaseAvailable())
    
    // Test API endpoint directly
    console.log('1. Testing API endpoint directly...')
    const apiResponse = await fetch('/api/campaigns')
    const apiResult = await apiResponse.json()
    console.log('API Response:', apiResult)
    
    // Test legacy compatibility service
    console.log('2. Testing legacy compatibility service...')
    const legacyCampaigns = await legacyCompatibility.getCampaigns()
    console.log('Legacy Campaigns:', legacyCampaigns)
    
    return {
      environment: {
        VITE_USE_DATABASE: import.meta.env.VITE_USE_DATABASE,
        FEATURES_USE_DATABASE: FEATURES.USE_DATABASE,
        isDatabaseAvailable: isDatabaseAvailable()
      },
      apiResponse: apiResult,
      legacyCampaigns,
      success: true
    }
  } catch (error) {
    console.error('❌ Debug failed:', error)
    return {
      error: error.message,
      success: false
    }
  }
}

// Add to window for browser console testing
if (typeof window !== 'undefined') {
  window.debugCampaigns = debugCampaigns
} 