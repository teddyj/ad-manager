/**
 * Legacy Compatibility Service
 * Provides backward compatibility between localStorage operations and database operations
 * Transforms data formats between legacy and new schema
 */
export class LegacyCompatibilityService {
  constructor() {
    // Use browser-safe database service that doesn't import Prisma
    this.dbPromise = null
  }

  async getDatabase() {
    if (!this.dbPromise) {
      this.dbPromise = (async () => {
        try {
          // Use browser-safe database service
          const { db } = await import('./database.browser.js')
          return db
        } catch (error) {
          console.log('ℹ️ Database service not available:', error.message)
          return null
        }
      })()
    }
    return this.dbPromise
  }

  // ======================
  // LEGACY CAMPAIGN OPERATIONS (for App.jsx dbOperations)
  // ======================

  /**
   * Legacy saveAd operation - converts to new campaign format
   */
  async saveAd(adData) {
    try {
      // For frontend operations, use the HTTP API instead of direct database calls
      if (typeof window !== 'undefined') {
        console.log('🌐 Using HTTP API for campaign save (client-side)')
        
        // Generate campaign ID and prepare data
        const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Create campaign object for API
        const campaignData = {
          id: campaignId,
          name: adData.campaignName || adData.name || 'Untitled Campaign',
          status: 'draft',
          createdAt: new Date().toISOString(),
          adData: adData
        }
        
        // Make HTTP request to backend API
        const response = await fetch('/api/campaigns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(campaignData)
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          // Transform back to legacy format for compatibility
          const legacyCampaign = {
            id: campaignId,
            name: campaignData.name,
            status: 'Draft',
            info: true,
            created: new Date().toLocaleDateString(),
            type: 'Display Campaign',
            budget: '$0.00',
            starts: 'Not Set',
            ends: 'Not Set',
            adData
          }
          return { success: true, campaign: legacyCampaign }
        }
        
        return { success: false, error: 'API call failed' }
      }
      
      // Server-side: Use same HTTP API approach as client-side
      console.log('🌐 Using HTTP API for campaign save (server-side)')
      
      // Generate campaign ID and prepare data
      const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Create campaign object for API
      const campaignData = {
        id: campaignId,
        name: adData.campaignName || adData.name || 'Untitled Campaign',
        status: 'draft',
        createdAt: new Date().toISOString(),
        adData: adData
      }
      
      // Make HTTP request to backend API
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Transform back to legacy format for compatibility
        const legacyCampaign = this.transformCampaignToLegacy(result.campaign)
        return { success: true, campaign: legacyCampaign }
      }
      
      return result
    } catch (error) {
      console.error('❌ Legacy saveAd failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Legacy getCampaigns operation - returns campaigns in legacy format
   */
  async getCampaigns() {
    console.log('📊 Using unified approach: localStorage + API for campaigns')
    
    try {
      // Get localStorage campaigns
      const localCampaigns = this.getLocalStorageData('campaigns') || []
      const savedCampaigns = this.getLocalStorageData('saved_campaigns') || []
      
      // Get campaigns saved via API
      let apiCampaigns = []
      try {
        const response = await fetch('/api/campaigns')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.campaigns) {
            apiCampaigns = result.campaigns.map(campaign => ({
              id: campaign.id,
              name: campaign.name,
              status: campaign.status || 'Draft',
              info: true,
              created: new Date(campaign.createdAt || campaign.savedAt).toLocaleDateString(),
              type: 'Campaign Flow V2',
              budget: '$0.00',
              starts: 'Not Set',
              ends: 'Not Set',
              adData: campaign.adData || campaign
            }))
          }
        }
      } catch (apiError) {
        console.warn('⚠️ Could not fetch API campaigns:', apiError)
      }
      
      // Combine all campaign sources
      const allCampaigns = [
        ...localCampaigns,
        ...savedCampaigns,
        ...apiCampaigns
      ]
      
      return allCampaigns
    } catch (error) {
      console.error('❌ Failed to get campaigns:', error)
      return []
    }
  }

  /**
   * Legacy clearOldCampaigns operation
   */
  async clearOldCampaigns() {
    // Check if we're on client side - if so, go straight to localStorage cleanup
    if (typeof window !== 'undefined') {
      console.log('🧹 Client-side detected, using localStorage cleanup')
      
      try {
        const localCampaigns = this.getLocalStorageData('campaigns') || []
        const savedCampaigns = this.getLocalStorageData('saved_campaigns') || []
        
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        // Filter out old campaigns
        const filteredCampaigns = localCampaigns.filter(c => {
          const created = new Date(c.created || c.createdAt || Date.now())
          return created >= thirtyDaysAgo || c.status !== 'draft'
        })
        
        const filteredSaved = savedCampaigns.filter(c => {
          const created = new Date(c.created || c.createdAt || Date.now())
          return created >= thirtyDaysAgo || c.status !== 'draft'
        })
        
        // Calculate cleared count
        const clearedCount = (localCampaigns.length - filteredCampaigns.length) +
                           (savedCampaigns.length - filteredSaved.length)
        
        // Save back to localStorage
        localStorage.setItem('campaigns', JSON.stringify(filteredCampaigns))
        localStorage.setItem('saved_campaigns', JSON.stringify(filteredSaved))
        
        return { success: true, cleared: clearedCount }
      } catch (error) {
        console.error('❌ localStorage cleanup failed:', error)
        return { success: false, error: error.message }
      }
    }

    try {
      // Get campaigns older than 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const campaigns = await this.db.getCampaigns()
      const oldCampaigns = campaigns.filter(c => 
        new Date(c.createdAt) < thirtyDaysAgo && c.status === 'draft'
      )

      // Delete old campaigns
      let deletedCount = 0
      for (const campaign of oldCampaigns) {
        const result = await this.db.deleteCampaign(campaign.id)
        if (result.success) deletedCount++
      }

      return { success: true, cleared: deletedCount }
    } catch (error) {
      console.log('🔄 Database unavailable, falling back to localStorage cleanup...')
      
      // Fallback to localStorage cleanup
      try {
        const localCampaigns = this.getLocalStorageData('campaigns') || []
        const savedCampaigns = this.getLocalStorageData('saved_campaigns') || []
        
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        // Filter out old campaigns
        const filteredCampaigns = localCampaigns.filter(c => {
          const created = new Date(c.created || c.createdAt || Date.now())
          return created >= thirtyDaysAgo || c.status !== 'draft'
        })
        
        const filteredSaved = savedCampaigns.filter(c => {
          const created = new Date(c.created || c.createdAt || Date.now())
          return created >= thirtyDaysAgo || c.status !== 'draft'
        })
        
        // Calculate cleared count
        const clearedCount = (localCampaigns.length - filteredCampaigns.length) +
                           (savedCampaigns.length - filteredSaved.length)
        
        // Save back to localStorage
        localStorage.setItem('campaigns', JSON.stringify(filteredCampaigns))
        localStorage.setItem('saved_campaigns', JSON.stringify(filteredSaved))
        
        return { success: true, cleared: clearedCount }
      } catch (fallbackError) {
        console.error('❌ Fallback cleanup also failed:', fallbackError)
        return { success: false, error: fallbackError.message }
      }
    }
  }

  /**
   * Legacy getStorageInfo operation - simulates storage usage for compatibility
   */
  async getStorageInfo() {
    try {
      const metrics = await this.db.getMetrics()
      
      if (metrics.error) {
        return {
          used: 0,
          max: 5242880, // 5MB
          percentage: 0,
          campaigns: 0,
          products: 0
        }
      }

      // Simulate storage usage based on record counts
      const estimatedUsage = (metrics.campaignCount * 1000) + (metrics.productCount * 2000)
      const maxStorage = 5242880 // 5MB
      
      return {
        used: estimatedUsage,
        max: maxStorage,
        percentage: Math.round((estimatedUsage / maxStorage) * 100),
        campaigns: metrics.campaignCount,
        products: metrics.productCount
      }
    } catch (error) {
      console.error('❌ Legacy getStorageInfo failed:', error)
      return {
        used: 0,
        max: 5242880,
        percentage: 0,
        campaigns: 0,
        products: 0
      }
    }
  }

  // ======================
  // LEGACY PRODUCT OPERATIONS
  // ======================

  /**
   * Legacy saveProduct operation
   */
  async saveProduct(productData) {
    try {
      const result = await this.db.createProduct(productData)
      
      if (result.success) {
        // Transform to legacy format
        const legacyProduct = this.transformProductToLegacy(result.product)
        return { success: true, product: legacyProduct }
      }
      
      return result
    } catch (error) {
      console.error('❌ Legacy saveProduct failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Legacy getProducts operation
   */
  async getProducts() {
    // Check if we're on client side - if so, go straight to localStorage
    if (typeof window !== 'undefined') {
      console.log('📦 Client-side detected, using localStorage for products')
      const localProducts = this.getLocalStorageData('products')
      return localProducts || []
    }

    try {
      const products = await this.db.getProducts()
      
      // Transform to legacy format
      return products.map(product => this.transformProductToLegacy(product))
    } catch (error) {
      console.log('🔄 Database unavailable, falling back to localStorage...')
      
      // Fallback to localStorage
      const localProducts = this.getLocalStorageData('products')
      return localProducts || []
    }
  }

  /**
   * Legacy updateProduct operation
   */
  async updateProduct(productId, updates) {
    try {
      const result = await this.db.updateProduct(productId, updates)
      
      if (result.success) {
        const legacyProduct = this.transformProductToLegacy(result.product)
        return { success: true, product: legacyProduct }
      }
      
      return result
    } catch (error) {
      console.error('❌ Legacy updateProduct failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Legacy deleteProduct operation
   */
  async deleteProduct(productId) {
    try {
      return await this.db.deleteProduct(productId)
    } catch (error) {
      console.error('❌ Legacy deleteProduct failed:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================
  // TRANSFORMATION UTILITIES
  // ======================

  /**
   * Transform legacy adData to new campaign format
   */
  transformLegacyToCampaign(adData) {
    const CTA_TYPE_WHERE_TO_BUY = 'WHERE_TO_BUY' // From App.jsx

    return {
      name: adData.campaignName || 'Untitled Campaign',
      type: adData.ctaType === CTA_TYPE_WHERE_TO_BUY ? 'Where to Buy' : 'Add to Cart',
      status: 'draft',
      productId: adData.productId || null,
      
      // Store legacy data in structured format
      legacyData: {
        ...adData,
        // Remove large image data to prevent database bloat
        imageSrc: adData.imageSrc ? '[Legacy Image Data]' : null,
        originalImage: adData.originalImage ? '[Legacy Original Image]' : null
      },
      
      // Extract structured data from legacy format
      audienceConfig: adData.audience || {},
      creativeConfig: {
        adSize: adData.adSize,
        ctaType: adData.ctaType,
        elements: adData.elements || [],
        canvasData: adData.canvasData || null
      },
      
      source: 'legacy'
    }
  }

  /**
   * Transform new campaign format to legacy format
   */
  transformCampaignToLegacy(campaign) {
    return {
      id: campaign.legacyId || campaign.id,
      productId: campaign.productId,
      name: campaign.name,
      status: this.capitalizeFirst(campaign.status),
      info: true,
      created: new Date(campaign.createdAt).toLocaleDateString(),
      type: campaign.type || 'Display Campaign',
      budget: '$0.00', // Default for compatibility
      starts: campaign.startsAt ? new Date(campaign.startsAt).toLocaleDateString() : 'Not Set',
      ends: campaign.endsAt ? new Date(campaign.endsAt).toLocaleDateString() : 'Not Set',
      adData: {
        campaignName: campaign.name,
        productId: campaign.productId,
        audience: campaign.audienceConfig || {},
        ...campaign.creativeConfig,
        ...campaign.legacyData
      },
      source: campaign.source || 'v2'
    }
  }

  /**
   * Transform new product format to legacy format
   */
  transformProductToLegacy(product) {
    return {
      id: product.legacyId || product.id,
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category,
      price: product.price?.toString(),
      sku: product.sku,
      url: product.url,
      utmCodes: product.utmCodes || {},
      metadata: product.metadata || {},
      settings: product.settings || {},
      status: product.status,
      created: product.createdAt,
      updated: product.updatedAt,
      
      // Transform images
      images: product.images?.map(img => ({
        id: img.id,
        url: img.url,
        fileName: img.fileName,
        altText: img.altText,
        isPrimary: img.isPrimary,
        size: img.size,
        
        // Transform background versions
        backgroundVersions: img.backgroundVersions?.map(bg => ({
          id: bg.id,
          url: bg.url,
          prompt: bg.prompt,
          requestId: bg.requestId,
          processingTime: bg.processingTime,
          metadata: bg.metadata,
          isActive: bg.isActive,
          created: bg.createdAt
        })) || []
      })) || []
    }
  }

  // ======================
  // MIGRATION UTILITIES
  // ======================

  /**
   * Migrate data from localStorage to database
   */
  async migrateLocalStorageData() {
    try {
      console.log('🔄 Starting localStorage migration...')
      
      // Get data from localStorage
      const localStorageData = {
        products: this.getLocalStorageData('products'),
        campaigns: this.getLocalStorageData('campaigns'),
        savedCampaigns: this.getLocalStorageData('saved_campaigns'),
        backgrounds: this.getLocalStorageData('backgrounds')
      }

      // Migrate using database service
      const results = await this.db.migrateFromLocalStorage(localStorageData)
      
      console.log('✅ Migration completed:', results)
      return results
    } catch (error) {
      console.error('❌ Migration failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Validate migration by comparing localStorage and database data
   */
  async validateMigration() {
    try {
      const localProducts = this.getLocalStorageData('products')
      const localCampaigns = this.getLocalStorageData('campaigns')
      
      const dbProducts = await this.db.getProducts()
      const dbCampaigns = await this.db.getCampaigns()
      
      const validation = {
        products: {
          localStorage: localProducts.length,
          database: dbProducts.length,
          match: localProducts.length === dbProducts.length
        },
        campaigns: {
          localStorage: localCampaigns.length,
          database: dbCampaigns.length,
          match: localCampaigns.length === dbCampaigns.length
        },
        overall: {
          success: localProducts.length === dbProducts.length && 
                   localCampaigns.length === dbCampaigns.length
        }
      }

      console.log('📊 Migration validation:', validation)
      return validation
    } catch (error) {
      console.error('❌ Validation failed:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================
  // HELPER UTILITIES
  // ======================

  /**
   * Get data from localStorage safely
   */
  getLocalStorageData(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch (error) {
      console.warn(`⚠️ Failed to parse localStorage key '${key}':`, error)
      return []
    }
  }

  /**
   * Capitalize first letter of string
   */
  capitalizeFirst(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str
  }

  /**
   * Check if database is available for operations
   */
  async isDatabaseAvailable() {
    try {
      const db = await this.getDatabase()
      return db && db.isAvailable()
    } catch (error) {
      return false
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus() {
    try {
      const localProducts = this.getLocalStorageData('products')
      const localCampaigns = this.getLocalStorageData('campaigns')
      
      if (!this.isDatabaseAvailable()) {
        return {
          status: 'database_unavailable',
          localData: {
            products: localProducts.length,
            campaigns: localCampaigns.length
          }
        }
      }

      const dbMetrics = await this.db.getMetrics()
      
      return {
        status: 'ready',
        localData: {
          products: localProducts.length,
          campaigns: localCampaigns.length
        },
        databaseData: {
          products: dbMetrics.productCount || 0,
          campaigns: dbMetrics.campaignCount || 0
        },
        migrationNeeded: localProducts.length > 0 || localCampaigns.length > 0
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      }
    }
  }
}

// Export singleton instance
export const legacyCompatibility = new LegacyCompatibilityService() 