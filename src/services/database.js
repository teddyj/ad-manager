import { createClient } from '@supabase/supabase-js'

/**
 * Database Service for Campaign Builder Application
 * Handles all database operations using Prisma ORM and Supabase
 */
class DatabaseService {
  constructor() {
    this.supabase = null
    this.prisma = null
    this.initialized = false
    this.initializeClients()
  }

  async initializeClients() {
    try {
      // Initialize Supabase client
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey)
        console.log('✅ Supabase client initialized')
      } else {
        // Only warn about missing Supabase credentials in production
        if (import.meta.env.PROD) {
          console.warn('⚠️ Supabase credentials not found - file storage disabled')
        } else {
          console.log('ℹ️ Local development mode - using file-based storage (Supabase not required)')
        }
      }

      // Initialize Prisma client (server-side only)
      if (typeof window === 'undefined') {
        try {
          // Dynamically import Prisma only on server-side
          const { PrismaClient } = await import('@prisma/client')
          this.prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error']
          })
          console.log('✅ Prisma client initialized')
        } catch (prismaError) {
          console.log('ℹ️ Prisma not available in browser environment')
        }
      }

      this.initialized = true
    } catch (error) {
      console.error('❌ Failed to initialize database clients:', error)
    }
  }

  // Check if database is available
  isAvailable() {
    return this.initialized && (this.prisma !== null || this.supabase !== null)
  }

  // ======================
  // PRODUCT OPERATIONS
  // ======================

  async createProduct(data, userId = 'default-user') {
    if (!this.prisma) {
      throw new Error('Database not available on client side')
    }

    try {
      const product = await this.prisma.product.create({
        data: {
          ...data,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          images: true
        }
      })

      console.log('✅ Product created:', product.id)
      return { success: true, product }
    } catch (error) {
      console.error('❌ Failed to create product:', error)
      return { success: false, error: error.message }
    }
  }

  async getProducts(userId = 'default-user') {
    if (!this.prisma) {
      throw new Error('Database not available on client side')
    }

    try {
      const products = await this.prisma.product.findMany({
        where: { userId },
        include: {
          images: {
            include: {
              backgroundVersions: true
            }
          },
          campaigns: {
            select: { id: true, name: true, status: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return products
    } catch (error) {
      console.error('❌ Failed to get products:', error)
      return []
    }
  }

  async updateProduct(productId, updates) {
    if (!this.prisma) {
      throw new Error('Database not available on client side')
    }

    try {
      const product = await this.prisma.product.update({
        where: { id: productId },
        data: {
          ...updates,
          updatedAt: new Date()
        },
        include: {
          images: {
            include: {
              backgroundVersions: true
            }
          }
        }
      })

      return { success: true, product }
    } catch (error) {
      console.error('❌ Failed to update product:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteProduct(productId) {
    if (!this.prisma) {
      throw new Error('Database not available on client side')
    }

    try {
      await this.prisma.product.delete({
        where: { id: productId }
      })

      return { success: true }
    } catch (error) {
      console.error('❌ Failed to delete product:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================
  // CAMPAIGN OPERATIONS
  // ======================

  async createCampaign(data, userId = 'default-user') {
    if (!this.prisma) {
      throw new Error('Database not available on client side')
    }

    try {
      const campaign = await this.prisma.campaign.create({
        data: {
          ...data,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          product: {
            select: { id: true, name: true, brand: true }
          },
          creatives: true
        }
      })

      console.log('✅ Campaign created:', campaign.id)
      return { success: true, campaign }
    } catch (error) {
      console.error('❌ Failed to create campaign:', error)
      return { success: false, error: error.message }
    }
  }

  async getCampaigns(userId = 'default-user') {
    if (!this.prisma) {
      throw new Error('Database not available on client side')
    }

    try {
      const campaigns = await this.prisma.campaign.findMany({
        where: { userId },
        include: {
          product: {
            select: { id: true, name: true, brand: true }
          },
          creatives: {
            select: { id: true, name: true, formatId: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return campaigns
    } catch (error) {
      console.error('❌ Failed to get campaigns:', error)
      return []
    }
  }

  async updateCampaign(campaignId, updates) {
    if (!this.prisma) {
      throw new Error('Database not available on client side')
    }

    try {
      const campaign = await this.prisma.campaign.update({
        where: { id: campaignId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      })

      return { success: true, campaign }
    } catch (error) {
      console.error('❌ Failed to update campaign:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================
  // CAMPAIGN DRAFT OPERATIONS
  // ======================

  async saveCampaignDraft(campaignId, stepData) {
    if (!this.prisma) {
      throw new Error('Database not available on client side')
    }

    try {
      const draft = await this.prisma.campaignDraft.upsert({
        where: { campaignId },
        update: {
          stepData,
          autoSavedAt: new Date()
        },
        create: {
          campaignId,
          stepData,
          autoSavedAt: new Date()
        }
      })

      return { success: true, draft }
    } catch (error) {
      console.error('❌ Failed to save campaign draft:', error)
      return { success: false, error: error.message }
    }
  }

  async getCampaignDraft(campaignId) {
    if (!this.prisma) {
      throw new Error('Database not available on client side')
    }

    try {
      const draft = await this.prisma.campaignDraft.findUnique({
        where: { campaignId }
      })

      return draft
    } catch (error) {
      console.error('❌ Failed to get campaign draft:', error)
      return null
    }
  }

  async deleteCampaignDraft(campaignId) {
    if (!this.prisma) {
      throw new Error('Database not available on client side')
    }

    try {
      await this.prisma.campaignDraft.delete({
        where: { campaignId }
      })

      return { success: true }
    } catch (error) {
      console.error('❌ Failed to delete campaign draft:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================
  // FILE UPLOAD OPERATIONS
  // ======================

  async uploadFile(bucket, path, file, options = {}) {
    if (!this.supabase) {
      throw new Error('Supabase not available - file upload disabled')
    }

    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          ...options
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(path)

      return {
        success: true,
        data: {
          ...data,
          publicUrl,
          storagePath: path
        }
      }
    } catch (error) {
      console.error('❌ Failed to upload file:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteFile(bucket, path) {
    if (!this.supabase) {
      throw new Error('Supabase not available - file operations disabled')
    }

    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([path])

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('❌ Failed to delete file:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================
  // HEALTH CHECK & UTILITIES
  // ======================

  async healthCheck() {
    try {
      if (this.prisma) {
        await this.prisma.$queryRaw`SELECT 1`
        return { status: 'healthy', timestamp: new Date(), service: 'prisma' }
      } else if (this.supabase) {
        const { error } = await this.supabase.from('users').select('count').limit(1)
        if (error && error.code !== 'PGRST116') throw error // PGRST116 is "relation does not exist" which is expected during setup
        return { status: 'healthy', timestamp: new Date(), service: 'supabase' }
      }
      
      return { status: 'unavailable', timestamp: new Date() }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date() 
      }
    }
  }

  async getMetrics() {
    if (!this.prisma) {
      return { error: 'Database not available' }
    }

    try {
      const [productCount, campaignCount, draftCount] = await Promise.all([
        this.prisma.product.count(),
        this.prisma.campaign.count(),
        this.prisma.campaignDraft.count()
      ])

      return {
        productCount,
        campaignCount,
        draftCount,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('❌ Failed to get metrics:', error)
      return { error: error.message }
    }
  }

  // ======================
  // CLEANUP OPERATIONS
  // ======================

  async cleanupExpiredDrafts() {
    if (!this.prisma) {
      return { error: 'Database not available' }
    }

    try {
      const result = await this.prisma.campaignDraft.deleteMany({
        where: {
          expiresAt: { lt: new Date() }
        }
      })

      console.log(`🧹 Cleaned up ${result.count} expired drafts`)
      return { success: true, cleaned: result.count }
    } catch (error) {
      console.error('❌ Failed to cleanup expired drafts:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================
  // MIGRATION UTILITIES
  // ======================

  async migrateFromLocalStorage(localStorageData) {
    if (!this.prisma) {
      throw new Error('Database not available for migration')
    }

    const results = {
      products: { success: 0, failed: 0, errors: [] },
      campaigns: { success: 0, failed: 0, errors: [] }
    }

    // Migrate products
    if (localStorageData.products) {
      for (const product of localStorageData.products) {
        try {
          await this.createProduct({
            name: product.name,
            description: product.description,
            brand: product.brand,
            category: product.category,
            price: product.price,
            metadata: product.metadata || {},
            legacyId: product.id
          })
          results.products.success++
        } catch (error) {
          results.products.failed++
          results.products.errors.push(`${product.name}: ${error.message}`)
        }
      }
    }

    // Migrate campaigns
    if (localStorageData.campaigns) {
      for (const campaign of localStorageData.campaigns) {
        try {
          await this.createCampaign({
            name: campaign.name,
            type: campaign.type,
            status: campaign.status?.toLowerCase() || 'draft',
            legacyData: campaign.adData || {},
            source: 'migrated',
            legacyId: campaign.id
          })
          results.campaigns.success++
        } catch (error) {
          results.campaigns.failed++
          results.campaigns.errors.push(`${campaign.name}: ${error.message}`)
        }
      }
    }

    return results
  }

  // Close connections
  async disconnect() {
    try {
      if (this.prisma) {
        await this.prisma.$disconnect()
        console.log('✅ Prisma disconnected')
      }
    } catch (error) {
      console.error('❌ Failed to disconnect from database:', error)
    }
  }
}

// Create and export singleton instance
export const db = new DatabaseService()

// Export class for testing
export { DatabaseService } 