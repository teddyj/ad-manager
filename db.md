# Database Migration Plan for Campaign Builder Application

## Executive Summary

This document outlines a comprehensive plan to migrate the Campaign Builder application from localStorage-based data persistence to a robust database solution. The migration will improve data reliability, enable multi-user functionality, support production scaling, and provide better data integrity.

## Current State Analysis

### Current Data Storage Patterns
The application currently uses localStorage with the following data entities:

1. **Campaigns** (`localStorage['campaigns']`)
   - Legacy campaigns from original flow
   - V2 campaigns from new flow (`localStorage['saved_campaigns']`)
   - Draft campaigns (`localStorage['campaign_draft_{id}']`, `localStorage['campaign_minimal_{id}']`)

2. **Products** (`localStorage['products']`)
   - Product catalog with images, metadata, UTM codes
   - Background versions for product images

3. **Backgrounds** (`localStorage['backgrounds']`)
   - AI-generated backgrounds from fal.ai service

4. **Sample Data** (`localStorage['sample_data']`)
   - Demo products and campaigns for onboarding

### Current Data Volumes & Storage Issues
- **Storage Limit**: ~5MB localStorage limit causing frequent quota exceeded errors
- **Data Cleanup**: Automatic cleanup of old drafts (3+ days old)
- **Size Management**: Image data compression and selective saving strategies
- **Cache Management**: In-memory caching for product info scraping

### Current Infrastructure
- **Frontend**: React 18.2.0 + Vite
- **Backend**: Express.js server (server.cjs) + Vercel serverless functions
- **Deployment**: Vercel with SFO1 region
- **APIs**: Product image scraping, fal.ai background generation, OpenAI integration

## Recommended Technology Stack

### Database: PostgreSQL with Supabase
**Primary Recommendation: Supabase (PostgreSQL)**

**Rationale:**
- **Full-stack solution**: Database + Auth + Real-time + Storage + Edge Functions
- **PostgreSQL**: Robust relational database with JSON support for flexible schemas
- **Vercel Integration**: Excellent compatibility with current Vercel deployment
- **Developer Experience**: Built-in admin dashboard, automatic API generation
- **Scalability**: Handles growth from MVP to enterprise scale
- **Cost-effective**: Generous free tier, predictable pricing

**Alternative Options:**
1. **Vercel Postgres** (if staying purely in Vercel ecosystem)
2. **PlanetScale** (MySQL-compatible with branching)
3. **Railway PostgreSQL** (simple deployment)

### ORM/Database Layer: Prisma
**Rationale:**
- **Type Safety**: Full TypeScript support with generated types
- **Schema Management**: Declarative schema with migrations
- **Developer Experience**: Excellent tooling, Prisma Studio for admin
- **Multi-database Support**: Easy to switch between databases if needed
- **Active Development**: Strong community and frequent updates

### File Storage: Supabase Storage
**Rationale:**
- **Integrated Solution**: Works seamlessly with Supabase database
- **CDN**: Global CDN for fast image delivery
- **Image Optimization**: Built-in image transformations
- **Security**: Row-level security policies
- **Cost-effective**: Better pricing than AWS S3 for smaller scales

### Caching Layer: Redis (Upstash)
**Rationale:**
- **Serverless Redis**: Compatible with Vercel serverless functions
- **Session Management**: Store user sessions and temporary data
- **API Caching**: Cache expensive operations (AI generations, scraping)
- **Rate Limiting**: Built-in rate limiting capabilities

## Database Schema Design

### Core Tables

```sql
-- Users (for future multi-user support)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  brand VARCHAR(255),
  category VARCHAR(100),
  price DECIMAL(10,2),
  sku VARCHAR(100),
  url TEXT,
  utm_codes JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  file_name VARCHAR(255),
  alt_text TEXT,
  size VARCHAR(20),
  is_primary BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Background Versions (for product images)
CREATE TABLE background_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_image_id UUID REFERENCES product_images(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  prompt TEXT,
  request_id VARCHAR(255),
  processing_time INTEGER,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft',
  budget DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  launched_at TIMESTAMP WITH TIME ZONE,
  
  -- Campaign Configuration
  audience_config JSONB DEFAULT '{}',
  platform_config JSONB DEFAULT '{}',
  creative_config JSONB DEFAULT '{}',
  publish_config JSONB DEFAULT '{}',
  
  -- Legacy Support
  legacy_data JSONB DEFAULT '{}',
  source VARCHAR(50) DEFAULT 'v2',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Drafts (for auto-save functionality)
CREATE TABLE campaign_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  step_data JSONB DEFAULT '{}',
  auto_saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Creatives
CREATE TABLE creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  name VARCHAR(255),
  format_id VARCHAR(100),
  format_name VARCHAR(100),
  width INTEGER,
  height INTEGER,
  elements JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creative Assets
CREATE TABLE creative_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID REFERENCES creatives(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'image', 'video', 'text', 'button'
  url TEXT,
  storage_path TEXT,
  content TEXT,
  styles JSONB DEFAULT '{}',
  position JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Integrations
CREATE TABLE platform_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform_id VARCHAR(50), -- 'meta', 'display', 'ctv', 'tiktok'
  platform_account_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Publications
CREATE TABLE campaign_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  platform_integration_id UUID REFERENCES platform_integrations(id),
  platform_campaign_id VARCHAR(255),
  status VARCHAR(50),
  metrics JSONB DEFAULT '{}',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Generation History
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'background', 'copy', 'creative'
  prompt TEXT,
  service VARCHAR(50), -- 'fal', 'openai', 'midjourney'
  request_id VARCHAR(255),
  response_data JSONB,
  processing_time INTEGER,
  cost_credits DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- Primary lookup indexes
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_product_id ON campaigns(product_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_creatives_campaign_id ON creatives(campaign_id);
CREATE INDEX idx_campaign_drafts_campaign_id ON campaign_drafts(campaign_id);

-- Time-based indexes
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX idx_campaign_drafts_expires_at ON campaign_drafts(expires_at);
CREATE INDEX idx_ai_generations_created_at ON ai_generations(created_at);

-- JSONB indexes for frequent queries
CREATE INDEX idx_campaigns_audience_config ON campaigns USING GIN(audience_config);
CREATE INDEX idx_campaigns_platform_config ON campaigns USING GIN(platform_config);
CREATE INDEX idx_products_metadata ON products USING GIN(metadata);
```

## Migration Strategy

### Phase 1: Infrastructure Setup (Week 1)

#### 1.1 Database Setup
```bash
# Install dependencies
npm install @supabase/supabase-js prisma @prisma/client
npm install -D prisma-supabase-types

# Initialize Prisma
npx prisma init
```

#### 1.2 Environment Configuration
```env
# .env.local
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
REDIS_URL="..."
```

#### 1.3 Prisma Schema Setup
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

generator supabase {
  provider = "prisma-supabase-types"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models based on schema above...
```

### Phase 2: Data Access Layer (Week 1-2)

#### 2.1 Database Service Setup
```javascript
// src/services/database.js
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

class DatabaseService {
  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    )
    this.prisma = new PrismaClient()
  }

  // Product operations
  async createProduct(data) {
    return await this.prisma.products.create({ data })
  }

  async getProducts(userId) {
    return await this.prisma.products.findMany({
      where: { user_id: userId },
      include: { 
        product_images: true,
        campaigns: { select: { id: true, name: true, status: true } }
      }
    })
  }

  // Campaign operations
  async createCampaign(data) {
    return await this.prisma.campaigns.create({ data })
  }

  async saveCampaignDraft(campaignId, stepData) {
    return await this.prisma.campaign_drafts.upsert({
      where: { campaign_id: campaignId },
      update: { 
        step_data: stepData,
        auto_saved_at: new Date()
      },
      create: {
        campaign_id: campaignId,
        step_data: stepData
      }
    })
  }

  // File upload operations
  async uploadFile(bucket, path, file) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) throw error
    return data
  }
}

export const db = new DatabaseService()
```

#### 2.2 Legacy Compatibility Layer
```javascript
// src/services/legacyCompatibility.js
export class LegacyCompatibilityService {
  constructor(databaseService) {
    this.db = databaseService
  }

  // Convert localStorage operations to database calls
  async saveAd(adData) {
    try {
      // Transform legacy adData to new campaign format
      const campaignData = this.transformLegacyToCampaign(adData)
      const campaign = await this.db.createCampaign(campaignData)
      
      return { success: true, campaign }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getCampaigns() {
    try {
      const campaigns = await this.db.getCampaigns()
      return campaigns.map(this.transformCampaignToLegacy)
    } catch (error) {
      console.error('Error getting campaigns:', error)
      return []
    }
  }

  transformLegacyToCampaign(adData) {
    return {
      name: adData.campaignName,
      type: adData.ctaType === 'WHERE_TO_BUY' ? 'Where to Buy' : 'Add to Cart',
      status: 'draft',
      product_id: adData.productId,
      legacy_data: adData,
      source: 'legacy'
    }
  }
}
```

### Phase 3: Gradual Migration (Week 2-3)

#### 3.1 Feature Flag Implementation
```javascript
// src/config/features.js
export const FEATURES = {
  USE_DATABASE: process.env.VITE_USE_DATABASE === 'true',
  MIGRATE_EXISTING_DATA: process.env.VITE_MIGRATE_EXISTING_DATA === 'true',
  // ... other features
}
```

#### 3.2 Hybrid Data Service
```javascript
// src/services/dataService.js
import { FEATURES } from '../config/features.js'
import { db } from './database.js'
import { LegacyCompatibilityService } from './legacyCompatibility.js'

class DataService {
  constructor() {
    this.useDatabase = FEATURES.USE_DATABASE
    this.legacyService = new LegacyCompatibilityService(db)
  }

  async saveProduct(productData) {
    if (this.useDatabase) {
      return await db.createProduct(productData)
    } else {
      return this.saveToLocalStorage('products', productData)
    }
  }

  async getProducts() {
    if (this.useDatabase) {
      return await db.getProducts()
    } else {
      return this.getFromLocalStorage('products')
    }
  }

  saveToLocalStorage(key, data) {
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      const newItem = { id: String(Date.now()), ...data }
      existing.push(newItem)
      localStorage.setItem(key, JSON.stringify(existing))
      return { success: true, item: newItem }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

export const dataService = new DataService()
```

### Phase 4: Data Migration Utilities (Week 3)

#### 4.1 Migration Scripts
```javascript
// scripts/migrate-localStorage.js
import { db } from '../src/services/database.js'

async function migrateLocalStorageData() {
  console.log('Starting localStorage migration...')
  
  // Migrate products
  const products = JSON.parse(localStorage.getItem('products') || '[]')
  for (const product of products) {
    try {
      await db.createProduct({
        name: product.name,
        description: product.description,
        brand: product.brand,
        category: product.category,
        metadata: product.metadata || {},
        legacy_id: product.id
      })
      console.log(`✅ Migrated product: ${product.name}`)
    } catch (error) {
      console.error(`❌ Failed to migrate product ${product.name}:`, error)
    }
  }
  
  // Migrate campaigns
  const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]')
  for (const campaign of campaigns) {
    try {
      await db.createCampaign({
        name: campaign.name,
        type: campaign.type,
        status: campaign.status.toLowerCase(),
        legacy_data: campaign.adData,
        source: 'migrated',
        legacy_id: campaign.id
      })
      console.log(`✅ Migrated campaign: ${campaign.name}`)
    } catch (error) {
      console.error(`❌ Failed to migrate campaign ${campaign.name}:`, error)
    }
  }
  
  console.log('Migration completed!')
}

// Run migration
migrateLocalStorageData()
```

#### 4.2 Data Validation
```javascript
// scripts/validate-migration.js
async function validateMigration() {
  const localProducts = JSON.parse(localStorage.getItem('products') || '[]')
  const dbProducts = await db.getProducts()
  
  console.log(`Local products: ${localProducts.length}`)
  console.log(`Database products: ${dbProducts.length}`)
  
  if (localProducts.length !== dbProducts.length) {
    console.warn('⚠️ Product count mismatch!')
  }
  
  // Validate data integrity
  for (const localProduct of localProducts) {
    const dbProduct = dbProducts.find(p => p.legacy_id === localProduct.id)
    if (!dbProduct) {
      console.error(`❌ Missing product in database: ${localProduct.name}`)
    }
  }
}
```

### Phase 5: Image Storage Migration (Week 3-4)

#### 5.1 File Upload Service
```javascript
// src/services/fileUpload.js
import { db } from './database.js'

export class FileUploadService {
  async uploadProductImage(file, productId) {
    const fileName = `${productId}/${Date.now()}-${file.name}`
    
    try {
      // Upload to Supabase Storage
      const { data } = await db.uploadFile('product-images', fileName, file)
      
      // Create database record
      const imageRecord = await db.prisma.product_images.create({
        data: {
          product_id: productId,
          url: `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`,
          storage_path: fileName,
          file_name: file.name,
          size: `${file.width}x${file.height}`
        }
      })
      
      return { success: true, image: imageRecord }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async uploadCreativeAsset(file, creativeId, type) {
    const fileName = `creatives/${creativeId}/${Date.now()}-${file.name}`
    
    try {
      const { data } = await db.uploadFile('creative-assets', fileName, file)
      
      const assetRecord = await db.prisma.creative_assets.create({
        data: {
          creative_id: creativeId,
          type,
          url: `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/creative-assets/${fileName}`,
          storage_path: fileName
        }
      })
      
      return { success: true, asset: assetRecord }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}
```

### Phase 6: Enhanced Features (Week 4-5)

#### 6.1 Real-time Updates
```javascript
// src/hooks/useRealtime.js
import { useEffect, useState } from 'react'
import { db } from '../services/database.js'

export function useRealtimeCampaigns(userId) {
  const [campaigns, setCampaigns] = useState([])
  
  useEffect(() => {
    const subscription = db.supabase
      .from('campaigns')
      .on('*', payload => {
        if (payload.eventType === 'INSERT') {
          setCampaigns(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setCampaigns(prev => prev.map(c => 
            c.id === payload.new.id ? payload.new : c
          ))
        } else if (payload.eventType === 'DELETE') {
          setCampaigns(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()
    
    return () => subscription.unsubscribe()
  }, [userId])
  
  return campaigns
}
```

#### 6.2 Caching Layer
```javascript
// src/services/cache.js
import { Redis } from '@upstash/redis'

class CacheService {
  constructor() {
    this.redis = Redis.fromEnv()
  }

  async get(key) {
    try {
      return await this.redis.get(key)
    } catch (error) {
      console.warn('Cache miss:', error)
      return null
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.redis.set(key, value, { ex: ttl })
    } catch (error) {
      console.warn('Cache set failed:', error)
    }
  }

  async invalidate(pattern) {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.warn('Cache invalidation failed:', error)
    }
  }
}

export const cache = new CacheService()
```

## Development Workflow

### Local Development Setup

```bash
# 1. Install dependencies
npm install @supabase/supabase-js prisma @prisma/client @upstash/redis

# 2. Set up environment variables
cp .env.example .env.local
# Fill in database credentials

# 3. Initialize database
npx prisma generate
npx prisma db push

# 4. Seed development data
npx prisma db seed

# 5. Start development with database
VITE_USE_DATABASE=true npm run dev:full
```

### Database Management

```json
// package.json scripts addition
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "node prisma/seed.js",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "migrate:localStorage": "node scripts/migrate-localStorage.js"
  }
}
```

### Testing Strategy

```javascript
// src/__tests__/database.test.js
import { db } from '../services/database.js'

describe('Database Service', () => {
  beforeEach(async () => {
    await db.prisma.$executeRaw`TRUNCATE TABLE products CASCADE`
  })

  test('should create and retrieve products', async () => {
    const productData = {
      name: 'Test Product',
      description: 'Test Description',
      user_id: 'test-user-id'
    }

    const created = await db.createProduct(productData)
    expect(created.name).toBe('Test Product')

    const products = await db.getProducts('test-user-id')
    expect(products).toHaveLength(1)
  })
})
```

## Deployment Strategy

### Environment Configuration

```yaml
# vercel.json additions
{
  "env": {
    "DATABASE_URL": "@database-url",
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key",
    "REDIS_URL": "@redis-url",
    "VITE_USE_DATABASE": "true"
  }
}
```

### Production Deployment Steps

1. **Staging Environment**
   ```bash
   # Create staging database
   # Deploy with VITE_USE_DATABASE=false
   # Test localStorage compatibility
   ```

2. **Migration Deployment**
   ```bash
   # Deploy migration scripts
   # Run data migration
   # Validate data integrity
   ```

3. **Production Switch**
   ```bash
   # Deploy with VITE_USE_DATABASE=true
   # Monitor for issues
   # Keep localStorage as backup
   ```

## Risk Mitigation

### Data Safety
- **Dual writes**: Write to both localStorage and database during transition
- **Rollback plan**: Ability to quickly switch back to localStorage
- **Data validation**: Comprehensive validation of migrated data
- **Backup strategy**: Regular database backups before major changes

### Performance
- **Pagination**: Implement pagination for large datasets
- **Caching**: Redis caching for expensive queries
- **Lazy loading**: Load data on demand
- **Connection pooling**: Efficient database connections

### Security
- **Row-level security**: Supabase RLS policies
- **API rate limiting**: Prevent abuse
- **Input validation**: Comprehensive input sanitization
- **Environment variables**: Secure credential management

## Monitoring & Maintenance

### Database Monitoring
```javascript
// src/services/monitoring.js
export class DatabaseMonitoring {
  async checkHealth() {
    try {
      await db.prisma.$queryRaw`SELECT 1`
      return { status: 'healthy', timestamp: new Date() }
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() }
    }
  }

  async getMetrics() {
    const [productCount, campaignCount, storageUsage] = await Promise.all([
      db.prisma.products.count(),
      db.prisma.campaigns.count(),
      this.getStorageUsage()
    ])

    return { productCount, campaignCount, storageUsage }
  }
}
```

### Cleanup Jobs
```javascript
// scripts/cleanup.js
async function cleanupExpiredDrafts() {
  const result = await db.prisma.campaign_drafts.deleteMany({
    where: {
      expires_at: { lt: new Date() }
    }
  })
  
  console.log(`Cleaned up ${result.count} expired drafts`)
}

// Run daily cleanup
setInterval(cleanupExpiredDrafts, 24 * 60 * 60 * 1000)
```

## Cost Analysis

### Estimated Monthly Costs (Production)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Supabase Pro | 2GB database, 100GB bandwidth | $25 |
| Upstash Redis | 10K commands/day | $0 (free tier) |
| Vercel Pro | Increased function limits | $20 |
| **Total** | | **~$45/month** |

### Cost Optimization
- **Free tiers**: Start with free tiers for all services
- **Usage-based scaling**: Pay only for what you use
- **Image optimization**: Automatic compression and CDN
- **Query optimization**: Efficient database queries with indexes

## Success Metrics

### Technical Metrics
- **Data Migration**: 100% successful migration of existing data
- **Performance**: <500ms API response times
- **Reliability**: 99.9% uptime
- **Storage**: Efficient storage utilization (50% reduction vs localStorage)

### User Experience
- **Zero downtime**: Seamless transition for users
- **Feature parity**: All existing features work with database
- **Improved reliability**: No more quota exceeded errors
- **Enhanced features**: Real-time updates, better search

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1: Infrastructure | Week 1 | Database setup, schema design, basic services |
| Phase 2: Data Layer | Week 1-2 | Database service, legacy compatibility |
| Phase 3: Migration | Week 2-3 | Hybrid data service, feature flags |
| Phase 4: Data Migration | Week 3 | Migration scripts, data validation |
| Phase 5: File Storage | Week 3-4 | Image upload service, storage migration |
| Phase 6: Enhanced Features | Week 4-5 | Real-time updates, caching, monitoring |
| **Total Timeline** | **5 weeks** | **Full database migration complete** |

## Next Steps

1. **Week 1**: Set up Supabase project and Prisma schema
2. **Week 1**: Implement basic database service layer
3. **Week 2**: Create legacy compatibility layer
4. **Week 2**: Implement feature flags and hybrid data service
5. **Week 3**: Run data migration scripts and validate
6. **Week 4**: Implement file storage and image migration
7. **Week 5**: Add real-time features and performance optimizations

This comprehensive plan provides a robust, scalable database solution while maintaining backward compatibility and minimizing risk during the migration process.