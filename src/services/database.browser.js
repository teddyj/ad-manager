/**
 * Browser-safe Database Service
 * Only includes Supabase client for file operations
 * Prisma operations are handled by the backend API
 */
import { createClient } from '@supabase/supabase-js'

class BrowserDatabaseService {
  constructor() {
    this.supabase = null
    this.initialized = false
    this.initializeClients()
  }

  initializeClients() {
    try {
      // Initialize Supabase client
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey)
        console.log('✅ Supabase client initialized (browser)')
      } else {
        console.log('ℹ️ Browser mode - using backend API for database operations')
      }

      this.initialized = true
    } catch (error) {
      console.error('❌ Failed to initialize browser database client:', error)
    }
  }

  // Check if database is available
  isAvailable() {
    return this.initialized
  }

  // All database operations throw error - should use HTTP API instead
  async createProduct() {
    throw new Error('Database operations not available in browser - use HTTP API')
  }

  async getProducts() {
    throw new Error('Database operations not available in browser - use HTTP API')
  }

  async createCampaign() {
    throw new Error('Database operations not available in browser - use HTTP API')
  }

  async getCampaigns() {
    throw new Error('Database operations not available in browser - use HTTP API')
  }

  // File operations can use Supabase if available
  async uploadFile(bucket, path, file, options = {}) {
    if (!this.supabase) {
      throw new Error('Supabase not configured - file operations disabled')
    }

    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file, options)

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('❌ Failed to upload file:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteFile(bucket, path) {
    if (!this.supabase) {
      throw new Error('Supabase not configured - file operations disabled')
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

  async healthCheck() {
    return {
      status: 'browser',
      message: 'Browser client active - database operations via HTTP API',
      timestamp: new Date().toISOString()
    }
  }

  async disconnect() {
    // No cleanup needed for browser client
    console.log('🔌 Browser database client disconnected')
  }
}

// Export singleton instance
export const db = new BrowserDatabaseService()
export { BrowserDatabaseService as DatabaseService } 