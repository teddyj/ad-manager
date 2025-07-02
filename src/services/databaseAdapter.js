import { legacyCompatibility } from './legacyCompatibility.js'
import { db } from './database.js'
import { FEATURES, isDatabaseAvailable } from '../config/features.js'

/**
 * Database Adapter Service
 * Provides seamless integration between localStorage and database operations
 * Maintains the exact same interface as existing dbOperations
 */
class DatabaseAdapter {
  constructor() {
    this.useDatabaseForOperations = FEATURES.USE_DATABASE && isDatabaseAvailable()
    this.migrationEnabled = FEATURES.MIGRATE_EXISTING_DATA
    
    // Debug: log the database configuration
    console.log('🔧 DatabaseAdapter Configuration:', {
      FEATURES_USE_DATABASE: FEATURES.USE_DATABASE,
      isDatabaseAvailable: isDatabaseAvailable(),
      useDatabaseForOperations: this.useDatabaseForOperations,
      env_VITE_USE_DATABASE: import.meta.env.VITE_USE_DATABASE
    })
    
    // Cache for synchronous access during component initialization
    this.campaignsCache = []
    this.productsCache = []
    this.cacheInitialized = false
    
    // Initialize migration status and cache
    this.migrationStatus = null
    this.checkMigrationStatus()
    this.initializeCache()
  }

  async checkMigrationStatus() {
    if (this.useDatabaseForOperations) {
      try {
        this.migrationStatus = await legacyCompatibility.getMigrationStatus()
      } catch (error) {
        console.warn('⚠️ Could not check migration status:', error)
        this.migrationStatus = { status: 'error', error: error.message }
      }
    }
  }

  async initializeCache() {
    try {
      // Load data for synchronous access
      if (this.useDatabaseForOperations) {
        console.log('📦 Initializing cache from database...')
        try {
          const [campaigns, products] = await Promise.all([
            legacyCompatibility.getCampaigns(),
            legacyCompatibility.getProducts()
          ])
          this.campaignsCache = Array.isArray(campaigns) ? campaigns : []
          this.productsCache = Array.isArray(products) ? products : []
          console.log('✅ Cache initialized from database', {
            campaigns: this.campaignsCache.length,
            products: this.productsCache.length
          })
        } catch (dbError) {
          console.warn('⚠️ Database initialization failed, falling back to localStorage:', dbError.message)
          // Fallback to localStorage when database fails
          const campaigns = this.getCampaignsFromLocalStorage()
          const products = this.getProductsFromLocalStorage()
          this.campaignsCache = Array.isArray(campaigns) ? campaigns : []
          this.productsCache = Array.isArray(products) ? products : []
          console.log('✅ Cache initialized from localStorage fallback', {
            campaigns: this.campaignsCache.length,
            products: this.productsCache.length
          })
        }
      } else {
        console.log('📦 Initializing cache from localStorage...')
        const campaigns = this.getCampaignsFromLocalStorage()
        const products = this.getProductsFromLocalStorage()
        this.campaignsCache = Array.isArray(campaigns) ? campaigns : []
        this.productsCache = Array.isArray(products) ? products : []
        console.log('✅ Cache initialized from localStorage', {
          campaigns: this.campaignsCache.length,
          products: this.productsCache.length
        })
      }
      this.cacheInitialized = true
    } catch (error) {
      console.error('❌ Critical cache initialization failure:', error)
      // Last resort fallback
      const campaigns = this.getCampaignsFromLocalStorage()
      const products = this.getProductsFromLocalStorage()
      this.campaignsCache = Array.isArray(campaigns) ? campaigns : []
      this.productsCache = Array.isArray(products) ? products : []
      this.cacheInitialized = true
      console.log('🆘 Emergency cache initialization completed', {
        campaigns: this.campaignsCache.length,
        products: this.productsCache.length
      })
    }
  }

  // ======================
  // CAMPAIGN OPERATIONS (matching existing App.jsx interface)
  // ======================

  async saveAd(adData) {
    try {
      // For Campaign Flow V2, always try the database API first since it's working
      console.log('💾 Attempting to save campaign via database API...')
      const result = await legacyCompatibility.saveAd(adData)
      // Update cache
      this.campaignsCache = await legacyCompatibility.getCampaigns()
      return result
    } catch (error) {
      console.error('❌ Failed to save campaign:', error)
      // NO localStorage fallback - prevents quota errors
      console.log('⚠️ Not falling back to localStorage to prevent quota errors')
      return { 
        success: false, 
        error: error.message,
        skipLocalStorage: true
      }
    }
  }

  getCampaigns() {
    // Synchronous access for component initialization
    if (!this.cacheInitialized || !this.campaignsCache) {
      console.log('📊 Loading campaigns from localStorage (cache not ready)...')
      const campaigns = this.getCampaignsFromLocalStorage()
      console.log('📊 localStorage campaigns:', typeof campaigns, Array.isArray(campaigns), campaigns)
      // Ensure we always return an array
      const result = Array.isArray(campaigns) ? campaigns : []
      console.log('📊 Returning campaigns:', typeof result, Array.isArray(result), result.length)
      return result
    }
    
    console.log('📊 Loading campaigns from cache...')
    console.log('📊 Cache campaigns:', typeof this.campaignsCache, Array.isArray(this.campaignsCache), this.campaignsCache)
    // Ensure we always return an array
    const result = Array.isArray(this.campaignsCache) ? this.campaignsCache : []
    console.log('📊 Returning cached campaigns:', typeof result, Array.isArray(result), result.length)
    return result
  }

  async getCampaignsAsync() {
    try {
      if (this.useDatabaseForOperations) {
        console.log('📊 Loading campaigns from database...')
        const campaigns = await legacyCompatibility.getCampaigns()
        this.campaignsCache = campaigns // Update cache
        return campaigns
      } else {
        console.log('📊 Loading campaigns from localStorage...')
        const campaigns = this.getCampaignsFromLocalStorage()
        this.campaignsCache = campaigns // Update cache
        return campaigns
      }
    } catch (error) {
      console.error('❌ Failed to get campaigns:', error)
      // Fallback to localStorage on database error
      if (this.useDatabaseForOperations) {
        console.log('🔄 Falling back to localStorage...')
        const campaigns = this.getCampaignsFromLocalStorage()
        this.campaignsCache = campaigns // Update cache
        return campaigns
      }
      return []
    }
  }

  async clearOldCampaigns() {
    try {
      if (this.useDatabaseForOperations) {
        console.log('🧹 Clearing old campaigns from database...')
        return await legacyCompatibility.clearOldCampaigns()
      } else {
        console.log('🧹 Clearing old campaigns from localStorage...')
        return this.clearOldCampaignsFromLocalStorage()
      }
    } catch (error) {
      console.error('❌ Failed to clear old campaigns:', error)
      return { success: false, error: error.message }
    }
  }

  async getStorageInfo() {
    try {
      if (this.useDatabaseForOperations) {
        console.log('📈 Getting storage info from database...')
        return await legacyCompatibility.getStorageInfo()
      } else {
        console.log('📈 Getting storage info from localStorage...')
        return this.getStorageInfoFromLocalStorage()
      }
    } catch (error) {
      console.error('❌ Failed to get storage info:', error)
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
  // PRODUCT OPERATIONS
  // ======================

  async saveProduct(productData) {
    try {
      if (this.useDatabaseForOperations) {
        console.log('📦 Saving product to database...')
        const result = await legacyCompatibility.saveProduct(productData)
        // Update cache
        this.productsCache = await legacyCompatibility.getProducts()
        return result
      } else {
        console.log('📦 Saving product to localStorage...')
        const result = this.saveProductToLocalStorage(productData)
        // Update cache
        this.productsCache = this.getProductsFromLocalStorage()
        return result
      }
    } catch (error) {
      console.error('❌ Failed to save product:', error)
      if (this.useDatabaseForOperations) {
        console.log('🔄 Falling back to localStorage...')
        const result = this.saveProductToLocalStorage(productData)
        // Update cache
        this.productsCache = this.getProductsFromLocalStorage()
        return result
      }
      throw error
    }
  }

  getProducts() {
    // Synchronous access for component initialization
    if (!this.cacheInitialized || !this.productsCache) {
      console.log('📦 Loading products from localStorage (cache not ready)...')
      const products = this.getProductsFromLocalStorage()
      // Ensure we always return an array
      return Array.isArray(products) ? products : []
    }
    
    console.log('📦 Loading products from cache...')
    // Ensure we always return an array
    return Array.isArray(this.productsCache) ? this.productsCache : []
  }

  async getProductsAsync() {
    try {
      if (this.useDatabaseForOperations) {
        console.log('📦 Loading products from database...')
        const products = await legacyCompatibility.getProducts()
        this.productsCache = products // Update cache
        return products
      } else {
        console.log('📦 Loading products from localStorage...')
        const products = this.getProductsFromLocalStorage()
        this.productsCache = products // Update cache
        return products
      }
    } catch (error) {
      console.error('❌ Failed to get products:', error)
      if (this.useDatabaseForOperations) {
        console.log('🔄 Falling back to localStorage...')
        const products = this.getProductsFromLocalStorage()
        this.productsCache = products // Update cache
        return products
      }
      return []
    }
  }

  async updateProduct(productId, updates) {
    try {
      if (this.useDatabaseForOperations) {
        console.log('📦 Updating product in database...')
        return await legacyCompatibility.updateProduct(productId, updates)
      } else {
        console.log('📦 Updating product in localStorage...')
        return this.updateProductInLocalStorage(productId, updates)
      }
    } catch (error) {
      console.error('❌ Failed to update product:', error)
      if (this.useDatabaseForOperations) {
        console.log('🔄 Falling back to localStorage...')
        return this.updateProductInLocalStorage(productId, updates)
      }
      throw error
    }
  }

  async deleteProduct(productId) {
    try {
      if (this.useDatabaseForOperations) {
        console.log('📦 Deleting product from database...')
        return await legacyCompatibility.deleteProduct(productId)
      } else {
        console.log('📦 Deleting product from localStorage...')
        return this.deleteProductFromLocalStorage(productId)
      }
    } catch (error) {
      console.error('❌ Failed to delete product:', error)
      if (this.useDatabaseForOperations) {
        console.log('🔄 Falling back to localStorage...')
        return this.deleteProductFromLocalStorage(productId)
      }
      throw error
    }
  }

  // ======================
  // CAMPAIGN DRAFT OPERATIONS (V2 Flow)
  // ======================

  async saveCampaignDraft(campaignId, stepData) {
    try {
      console.log('💾 Saving campaign draft to database...')
      // Always try database first, never use localStorage for drafts to prevent quota errors
      const response = await fetch('/api/campaign-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          campaignId,
          stepData
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error('❌ Failed to save campaign draft:', error)
      // No localStorage fallback to prevent quota errors
      return { success: false, error: error.message }
    }
  }

  async getCampaignDraft(campaignId) {
    try {
      console.log('📄 Loading campaign draft from database...')
      // Always try database, never use localStorage for drafts to prevent quota errors
      const response = await fetch(`/api/campaign-draft?campaignId=${campaignId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return null // No draft found
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return result.draft
    } catch (error) {
      console.error('❌ Failed to get campaign draft:', error)
      // No localStorage fallback to prevent quota errors
      return null
    }
  }

  async deleteCampaignDraft(campaignId) {
    try {
      console.log('🗑️ Deleting campaign draft from database...')
      // Always try database, never use localStorage for drafts to prevent quota errors
      const response = await fetch('/api/campaign-draft', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error('❌ Failed to delete campaign draft:', error)
      // No localStorage fallback to prevent quota errors
      return { success: false, error: error.message }
    }
  }

  // LocalStorage fallback methods for drafts
  saveCampaignDraftToLocalStorage(campaignId, stepData) {
    try {
      const draftKey = `campaign_draft_${campaignId}`
      const draftData = {
        campaignId,
        stepData,
        autoSavedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }
      
      localStorage.setItem(draftKey, JSON.stringify(draftData))
      
      return { success: true, draft: draftData }
    } catch (error) {
      console.error('❌ Failed to save draft to localStorage:', error)
      return { success: false, error: error.message }
    }
  }

  getCampaignDraftFromLocalStorage(campaignId) {
    try {
      const draftKey = `campaign_draft_${campaignId}`
      const draftData = localStorage.getItem(draftKey)
      
      if (!draftData) {
        return null
      }
      
      const draft = JSON.parse(draftData)
      
      // Check if draft has expired
      if (draft.expiresAt && new Date(draft.expiresAt) < new Date()) {
        localStorage.removeItem(draftKey)
        return null
      }
      
      return draft
    } catch (error) {
      console.error('❌ Failed to get draft from localStorage:', error)
      return null
    }
  }

  deleteCampaignDraftFromLocalStorage(campaignId) {
    try {
      const draftKey = `campaign_draft_${campaignId}`
      localStorage.removeItem(draftKey)
      
      return { success: true }
    } catch (error) {
      console.error('❌ Failed to delete draft from localStorage:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================
  // MIGRATION OPERATIONS
  // ======================

  async runMigration() {
    if (!this.useDatabaseForOperations) {
      throw new Error('Database not enabled - cannot run migration')
    }

    try {
      console.log('🔄 Starting localStorage to database migration...')
      const result = await legacyCompatibility.migrateLocalStorageData()
      
      // Refresh migration status
      await this.checkMigrationStatus()
      
      return result
    } catch (error) {
      console.error('❌ Migration failed:', error)
      throw error
    }
  }

  async validateMigration() {
    if (!this.useDatabaseForOperations) {
      throw new Error('Database not enabled - cannot validate migration')
    }

    try {
      return await legacyCompatibility.validateMigration()
    } catch (error) {
      console.error('❌ Migration validation failed:', error)
      throw error
    }
  }

  // ======================
  // HEALTH & STATUS
  // ======================

  async getHealthStatus() {
    const status = {
      localStorage: {
        available: typeof localStorage !== 'undefined',
        campaigns: this.getCampaignsFromLocalStorage().length,
        products: this.getProductsFromLocalStorage().length
      },
      database: {
        enabled: this.useDatabaseForOperations,
        available: isDatabaseAvailable(),
        health: null,
        migration: this.migrationStatus
      },
      currentMode: this.useDatabaseForOperations ? 'database' : 'localStorage'
    }

    if (this.useDatabaseForOperations) {
      try {
        status.database.health = await db.healthCheck()
      } catch (error) {
        status.database.health = { status: 'error', error: error.message }
      }
    }

    return status
  }

  // ======================
  // FALLBACK LOCALSTORAGE OPERATIONS
  // ======================

  saveAdToLocalStorage(adData) {
    try {
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]')
      const campaign = {
        id: `campaign_${Date.now()}`,
        name: adData.campaignName || 'Untitled Campaign',
        status: 'Draft',
        info: true,
        created: new Date().toLocaleDateString(),
        type: 'Display Campaign',
        budget: '$0.00',
        starts: 'Not Set',
        ends: 'Not Set',
        adData
      }
      
      campaigns.push(campaign)
      localStorage.setItem('campaigns', JSON.stringify(campaigns))
      
      return { success: true, campaign }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  getCampaignsFromLocalStorage() {
    try {
      return JSON.parse(localStorage.getItem('campaigns') || '[]')
    } catch (error) {
      console.error('Failed to parse campaigns from localStorage:', error)
      return []
    }
  }

  clearOldCampaignsFromLocalStorage() {
    try {
      const campaigns = this.getCampaignsFromLocalStorage()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const recentCampaigns = campaigns.filter(campaign => {
        const created = new Date(campaign.created)
        return created >= thirtyDaysAgo || campaign.status !== 'Draft'
      })
      
      const cleared = campaigns.length - recentCampaigns.length
      localStorage.setItem('campaigns', JSON.stringify(recentCampaigns))
      
      return { success: true, cleared }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  getStorageInfoFromLocalStorage() {
    try {
      const campaigns = this.getCampaignsFromLocalStorage()
      const products = this.getProductsFromLocalStorage()
      
      // Estimate storage usage
      const campaignSize = JSON.stringify(campaigns).length
      const productSize = JSON.stringify(products).length
      const used = campaignSize + productSize
      const max = 5242880 // 5MB
      
      return {
        used,
        max,
        percentage: Math.round((used / max) * 100),
        campaigns: campaigns.length,
        products: products.length
      }
    } catch (error) {
      return {
        used: 0,
        max: 5242880,
        percentage: 0,
        campaigns: 0,
        products: 0
      }
    }
  }

  saveProductToLocalStorage(productData) {
    try {
      const products = this.getProductsFromLocalStorage()
      const product = {
        id: `product_${Date.now()}`,
        ...productData,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }
      
      products.push(product)
      localStorage.setItem('products', JSON.stringify(products))
      
      return { success: true, product }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  getProductsFromLocalStorage() {
    try {
      return JSON.parse(localStorage.getItem('products') || '[]')
    } catch (error) {
      console.error('Failed to parse products from localStorage:', error)
      return []
    }
  }

  updateProductInLocalStorage(productId, updates) {
    try {
      const products = this.getProductsFromLocalStorage()
      const index = products.findIndex(p => p.id === productId)
      
      if (index === -1) {
        return { success: false, error: 'Product not found' }
      }
      
      products[index] = {
        ...products[index],
        ...updates,
        updated: new Date().toISOString()
      }
      
      localStorage.setItem('products', JSON.stringify(products))
      
      return { success: true, product: products[index] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  deleteProductFromLocalStorage(productId) {
    try {
      const products = this.getProductsFromLocalStorage()
      const filteredProducts = products.filter(p => p.id !== productId)
      
      localStorage.setItem('products', JSON.stringify(filteredProducts))
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ======================
  // UTILITY METHODS
  // ======================

  isUsingDatabase() {
    return this.useDatabaseForOperations
  }

  getMigrationStatus() {
    return this.migrationStatus
  }

  async refreshStatus() {
    await this.checkMigrationStatus()
    return this.getHealthStatus()
  }
}

// Export singleton instance
export const databaseAdapter = new DatabaseAdapter()

// Export class for testing
export { DatabaseAdapter } 