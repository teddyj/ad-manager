#!/usr/bin/env node

/**
 * Migration Script: localStorage to Database
 * 
 * This script migrates existing localStorage data to the new database structure.
 * Run with: npm run migrate:localStorage
 */

import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

/**
 * Mock localStorage data for testing migration
 * In a real scenario, this would be extracted from browser localStorage
 */
const mockLocalStorageData = {
  products: [
    {
      id: 'prod_1',
      name: 'Organic Protein Powder',
      description: 'Premium organic protein powder for fitness enthusiasts',
      brand: 'HealthCorp',
      category: 'health_wellness',
      price: 49.99,
      sku: 'HP-ORG-001',
      url: 'https://example.com/protein-powder',
      utmCodes: { utm_source: 'campaign', utm_medium: 'display' },
      metadata: { targetAge: [25, 45], interests: ['fitness', 'health'] },
      images: [
        {
          url: 'https://example.com/protein-powder.jpg',
          fileName: 'protein-powder.jpg',
          isPrimary: true
        }
      ]
    },
    {
      id: 'prod_2',
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      brand: 'AudioTech',
      category: 'electronics',
      price: 199.99,
      sku: 'AT-WH-002',
      url: 'https://example.com/headphones',
      utmCodes: { utm_source: 'social', utm_medium: 'facebook' },
      metadata: { targetAge: [18, 35], interests: ['music', 'technology'] }
    }
  ],
  
  campaigns: [
    {
      id: 'camp_1',
      name: 'Protein Powder Summer Campaign',
      productId: 'prod_1',
      type: 'Display Campaign',
      status: 'Published',
      adData: {
        campaignName: 'Protein Powder Summer Campaign',
        productId: 'prod_1',
        adSize: '1080x1080',
        ctaType: 'ADD_TO_CART',
        audience: {
          age: [25, 45],
          interests: ['fitness', 'health', 'organic'],
          locations: ['US', 'CA']
        },
        elements: [
          {
            id: 'headline',
            type: 'text',
            content: 'Fuel Your Fitness Journey',
            position: { x: 50, y: 100 },
            styles: { fontSize: 24, fontWeight: 'bold', color: '#333' }
          },
          {
            id: 'cta',
            type: 'button',
            content: 'Shop Now',
            position: { x: 50, y: 400 },
            styles: { backgroundColor: '#007bff', color: 'white' }
          }
        ]
      },
      created: '2024-01-15'
    },
    {
      id: 'camp_2',
      name: 'Headphones Holiday Sale',
      productId: 'prod_2',
      type: 'Social Campaign',
      status: 'Draft',
      adData: {
        campaignName: 'Headphones Holiday Sale',
        productId: 'prod_2',
        adSize: '1200x628',
        ctaType: 'WHERE_TO_BUY',
        audience: {
          age: [18, 35],
          interests: ['music', 'technology'],
          locations: ['US']
        },
        elements: [
          {
            id: 'headline',
            type: 'text',
            content: 'Premium Sound, Unbeatable Price',
            position: { x: 50, y: 80 },
            styles: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' }
          }
        ]
      },
      created: '2024-02-01'
    }
  ],
  
  saved_campaigns: [
    {
      id: 'saved_1',
      name: 'V2 Campaign Test',
      productId: 'prod_1',
      platforms: ['meta', 'display'],
      audienceConfig: {
        demographics: { age: [25, 54], gender: 'all' },
        interests: ['fitness', 'health'],
        locations: ['US']
      },
      status: 'draft',
      created: '2024-03-01'
    }
  ]
}

/**
 * Transform legacy product to database format
 */
function transformProduct(legacyProduct, userId = 'default-user') {
  return {
    userId,
    name: legacyProduct.name,
    description: legacyProduct.description,
    brand: legacyProduct.brand,
    category: legacyProduct.category,
    price: legacyProduct.price,
    sku: legacyProduct.sku,
    url: legacyProduct.url,
    utmCodes: legacyProduct.utmCodes || {},
    metadata: legacyProduct.metadata || {},
    settings: {},
    status: 'active',
    legacyId: legacyProduct.id
  }
}

/**
 * Transform legacy campaign to database format
 */
function transformCampaign(legacyCampaign, userId = 'default-user', productIdMap = {}) {
  const adData = legacyCampaign.adData || {}
  
  return {
    userId,
    productId: productIdMap[legacyCampaign.productId] || null,
    name: legacyCampaign.name,
    type: legacyCampaign.type,
    status: (legacyCampaign.status || 'draft').toLowerCase(),
    
    // Configuration data
    audienceConfig: adData.audience || {},
    platformConfig: {},
    creativeConfig: {
      adSize: adData.adSize,
      ctaType: adData.ctaType,
      elements: adData.elements || []
    },
    publishConfig: {},
    
    // Legacy data preservation
    legacyData: {
      ...adData,
      originalStatus: legacyCampaign.status,
      originalType: legacyCampaign.type,
      created: legacyCampaign.created
    },
    
    source: 'migrated',
    legacyId: legacyCampaign.id
  }
}

/**
 * Migrate products from legacy format
 */
async function migrateProducts(products, userId = 'default-user') {
  console.log(`📦 Migrating ${products.length} products...`)
  
  const productIdMap = {}
  const results = { success: 0, failed: 0, errors: [] }
  
  for (const legacyProduct of products) {
    try {
      const productData = transformProduct(legacyProduct, userId)
      
      const product = await prisma.product.create({
        data: productData
      })
      
      // Store mapping for campaign migration
      productIdMap[legacyProduct.id] = product.id
      
      // Create product images if they exist
      if (legacyProduct.images) {
        for (const img of legacyProduct.images) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: img.url,
              fileName: img.fileName,
              altText: img.altText,
              isPrimary: img.isPrimary || false,
              metadata: {}
            }
          })
        }
      }
      
      console.log(`✅ Migrated product: ${product.name} (${product.id})`)
      results.success++
    } catch (error) {
      console.error(`❌ Failed to migrate product ${legacyProduct.name}:`, error.message)
      results.failed++
      results.errors.push(`${legacyProduct.name}: ${error.message}`)
    }
  }
  
  return { results, productIdMap }
}

/**
 * Migrate campaigns from legacy format
 */
async function migrateCampaigns(campaigns, userId = 'default-user', productIdMap = {}) {
  console.log(`🎯 Migrating ${campaigns.length} campaigns...`)
  
  const results = { success: 0, failed: 0, errors: [] }
  
  for (const legacyCampaign of campaigns) {
    try {
      const campaignData = transformCampaign(legacyCampaign, userId, productIdMap)
      
      const campaign = await prisma.campaign.create({
        data: campaignData
      })
      
      console.log(`✅ Migrated campaign: ${campaign.name} (${campaign.id})`)
      results.success++
    } catch (error) {
      console.error(`❌ Failed to migrate campaign ${legacyCampaign.name}:`, error.message)
      results.failed++
      results.errors.push(`${legacyCampaign.name}: ${error.message}`)
    }
  }
  
  return results
}

/**
 * Migrate V2 campaigns (saved_campaigns)
 */
async function migrateV2Campaigns(campaigns, userId = 'default-user', productIdMap = {}) {
  console.log(`🎯 Migrating ${campaigns.length} V2 campaigns...`)
  
  const results = { success: 0, failed: 0, errors: [] }
  
  for (const legacyCampaign of campaigns) {
    try {
      const campaignData = {
        userId,
        productId: productIdMap[legacyCampaign.productId] || null,
        name: legacyCampaign.name,
        type: 'Multi-Platform Campaign',
        status: (legacyCampaign.status || 'draft').toLowerCase(),
        
        audienceConfig: legacyCampaign.audienceConfig || {},
        platformConfig: {
          selectedPlatforms: legacyCampaign.platforms || []
        },
        creativeConfig: {},
        publishConfig: {},
        
        legacyData: legacyCampaign,
        source: 'v2_migrated',
        legacyId: legacyCampaign.id
      }
      
      const campaign = await prisma.campaign.create({
        data: campaignData
      })
      
      console.log(`✅ Migrated V2 campaign: ${campaign.name} (${campaign.id})`)
      results.success++
    } catch (error) {
      console.error(`❌ Failed to migrate V2 campaign ${legacyCampaign.name}:`, error.message)
      results.failed++
      results.errors.push(`${legacyCampaign.name}: ${error.message}`)
    }
  }
  
  return results
}

/**
 * Create default user for migration
 */
async function createDefaultUser() {
  try {
    const user = await prisma.user.upsert({
      where: { email: 'default@example.com' },
      update: {},
      create: {
        email: 'default@example.com',
        name: 'Default User',
        settings: {}
      }
    })
    
    console.log(`✅ Default user ready: ${user.id}`)
    return user.id
  } catch (error) {
    console.error('❌ Failed to create default user:', error)
    throw error
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting localStorage to Database Migration')
  console.log('================================================')
  
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection established')
    
    // Create default user
    const userId = await createDefaultUser()
    
    // Load data (in real scenario, this would come from browser localStorage)
    const data = mockLocalStorageData
    
    console.log('\n📊 Migration Overview:')
    console.log(`- Products: ${data.products.length}`)
    console.log(`- Legacy Campaigns: ${data.campaigns.length}`)
    console.log(`- V2 Campaigns: ${data.saved_campaigns?.length || 0}`)
    
    // Migration summary
    const summary = {
      products: { success: 0, failed: 0, errors: [] },
      campaigns: { success: 0, failed: 0, errors: [] },
      v2Campaigns: { success: 0, failed: 0, errors: [] }
    }
    
    // Migrate products
    const productMigration = await migrateProducts(data.products, userId)
    summary.products = productMigration.results
    const productIdMap = productMigration.productIdMap
    
    // Migrate legacy campaigns
    const campaignMigration = await migrateCampaigns(data.campaigns, userId, productIdMap)
    summary.campaigns = campaignMigration
    
    // Migrate V2 campaigns
    if (data.saved_campaigns) {
      const v2Migration = await migrateV2Campaigns(data.saved_campaigns, userId, productIdMap)
      summary.v2Campaigns = v2Migration
    }
    
    // Print summary
    console.log('\n📋 Migration Summary:')
    console.log('====================')
    console.log(`Products: ${summary.products.success} success, ${summary.products.failed} failed`)
    console.log(`Campaigns: ${summary.campaigns.success} success, ${summary.campaigns.failed} failed`)
    console.log(`V2 Campaigns: ${summary.v2Campaigns.success} success, ${summary.v2Campaigns.failed} failed`)
    
    if (summary.products.errors.length > 0) {
      console.log('\n❌ Product Migration Errors:')
      summary.products.errors.forEach(error => console.log(`  - ${error}`))
    }
    
    if (summary.campaigns.errors.length > 0) {
      console.log('\n❌ Campaign Migration Errors:')
      summary.campaigns.errors.forEach(error => console.log(`  - ${error}`))
    }
    
    if (summary.v2Campaigns.errors.length > 0) {
      console.log('\n❌ V2 Campaign Migration Errors:')
      summary.v2Campaigns.errors.forEach(error => console.log(`  - ${error}`))
    }
    
    const totalSuccess = summary.products.success + summary.campaigns.success + summary.v2Campaigns.success
    const totalFailed = summary.products.failed + summary.campaigns.failed + summary.v2Campaigns.failed
    
    console.log(`\n🎉 Migration completed: ${totalSuccess} items migrated, ${totalFailed} failed`)
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Show usage instructions
 */
function showUsage() {
  console.log('Database Migration Script')
  console.log('========================')
  console.log('Usage: npm run migrate:localStorage')
  console.log('')
  console.log('This script migrates localStorage data to the database.')
  console.log('Make sure you have:')
  console.log('1. Database configured in .env')
  console.log('2. Prisma schema applied (npm run db:push)')
  console.log('3. Database tables created')
  console.log('')
  console.log('Options:')
  console.log('  --help    Show this help message')
  console.log('  --dry-run Show what would be migrated without making changes')
}

// Handle command line arguments
const args = process.argv.slice(2)

if (args.includes('--help')) {
  showUsage()
  process.exit(0)
}

if (args.includes('--dry-run')) {
  console.log('🔍 DRY RUN MODE - No changes will be made')
  console.log('This would migrate:')
  console.log(`- ${mockLocalStorageData.products.length} products`)
  console.log(`- ${mockLocalStorageData.campaigns.length} campaigns`)
  console.log(`- ${mockLocalStorageData.saved_campaigns?.length || 0} V2 campaigns`)
  process.exit(0)
}

// Run migration
runMigration().catch(console.error) 