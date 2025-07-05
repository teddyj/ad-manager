/**
 * Database Migration API Endpoint
 * This endpoint creates the database tables using raw SQL
 * Call this once after deployment to initialize the database schema
 */

import { Client } from 'pg';

// Database schema SQL
const CREATE_TABLES_SQL = `
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(255),
    category VARCHAR(255),
    price DECIMAL(10, 2),
    sku VARCHAR(255),
    url VARCHAR(255),
    utm_codes JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    legacy_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Images table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    storage_path VARCHAR(255),
    file_name VARCHAR(255),
    alt_text VARCHAR(255),
    size VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Background Versions table
CREATE TABLE IF NOT EXISTS background_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_image_id UUID NOT NULL REFERENCES product_images(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    storage_path VARCHAR(255),
    prompt TEXT,
    request_id VARCHAR(255),
    processing_time INTEGER,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    budget DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    launched_at TIMESTAMPTZ,
    audience_config JSONB DEFAULT '{}',
    platform_config JSONB DEFAULT '{}',
    creative_config JSONB DEFAULT '{}',
    publish_config JSONB DEFAULT '{}',
    legacy_data JSONB DEFAULT '{}',
    source VARCHAR(50) DEFAULT 'v2',
    legacy_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Drafts table
CREATE TABLE IF NOT EXISTS campaign_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    step_data JSONB DEFAULT '{}',
    auto_saved_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Creatives table
CREATE TABLE IF NOT EXISTS creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255),
    format_id VARCHAR(255),
    format_name VARCHAR(255),
    width INTEGER,
    height INTEGER,
    elements JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creative Assets table
CREATE TABLE IF NOT EXISTS creative_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creative_id UUID NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    url VARCHAR(255),
    storage_path VARCHAR(255),
    content TEXT,
    styles JSONB DEFAULT '{}',
    position JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Integrations table
CREATE TABLE IF NOT EXISTS platform_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    account_id VARCHAR(255),
    account_name VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    scopes JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Publications table
CREATE TABLE IF NOT EXISTS campaign_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    platform_integration_id UUID NOT NULL REFERENCES platform_integrations(id) ON DELETE CASCADE,
    platform_campaign_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    published_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Generations table
CREATE TABLE IF NOT EXISTS ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    prompt TEXT,
    result JSONB,
    metadata JSONB DEFAULT '{}',
    processing_time INTEGER,
    cost DECIMAL(10, 4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_legacy_id ON products(legacy_id);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);

CREATE INDEX IF NOT EXISTS idx_background_versions_product_image_id ON background_versions(product_image_id);
CREATE INDEX IF NOT EXISTS idx_background_versions_is_active ON background_versions(is_active);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_product_id ON campaigns(product_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_source ON campaigns(source);
CREATE INDEX IF NOT EXISTS idx_campaigns_legacy_id ON campaigns(legacy_id);

CREATE INDEX IF NOT EXISTS idx_campaign_drafts_campaign_id ON campaign_drafts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_drafts_expires_at ON campaign_drafts(expires_at);

CREATE INDEX IF NOT EXISTS idx_creatives_campaign_id ON creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creatives_is_active ON creatives(is_active);

CREATE INDEX IF NOT EXISTS idx_creative_assets_creative_id ON creative_assets(creative_id);

CREATE INDEX IF NOT EXISTS idx_platform_integrations_user_id ON platform_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_integrations_platform ON platform_integrations(platform);

CREATE INDEX IF NOT EXISTS idx_campaign_publications_campaign_id ON campaign_publications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_publications_platform_integration_id ON campaign_publications(platform_integration_id);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_type ON ai_generations(type);
`;

const CREATE_DEFAULT_USER_SQL = `
-- Create default user
INSERT INTO users (id, email, name, settings) 
VALUES ('00000000-0000-0000-0000-000000000001', 'default@example.com', 'Default User', '{}')
ON CONFLICT (id) DO NOTHING;
`;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client;

  try {
    console.log('🚀 Starting database migration...');

    // Create PostgreSQL client
    const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('POSTGRES') || key.includes('DATABASE')));
      throw new Error('No database connection string found. Expected POSTGRES_URL, POSTGRES_PRISMA_URL, or DATABASE_URL');
    }
    
    console.log('Connection string type:', connectionString.substring(0, 20) + '...');

    console.log('🔗 Connecting to database...');
    // Configure SSL for Supabase connections
    const sslConfig = connectionString.includes('supabase.co') || connectionString.includes('postgres://') 
      ? { rejectUnauthorized: false } 
      : false;
    
    client = new Client({
      connectionString: connectionString,
      ssl: sslConfig
    });

    await client.connect();
    console.log('✅ Database connection successful');

    // Run the migration SQL
    console.log('📊 Creating database tables...');
    await client.query(CREATE_TABLES_SQL);
    console.log('✅ Database tables created successfully');

    // Create default user
    console.log('👤 Creating default user...');
    await client.query(CREATE_DEFAULT_USER_SQL);
    console.log('✅ Default user created');

    // Test the setup by counting records
    console.log('🧪 Testing database setup...');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const campaignCount = await client.query('SELECT COUNT(*) FROM campaigns');
    
    console.log(`✅ Found ${userCount.rows[0].count} users and ${campaignCount.rows[0].count} campaigns`);

    console.log('🎉 Database migration completed successfully!');

    res.status(200).json({
      success: true,
      message: 'Database migration completed successfully',
      details: {
        tablesCreated: true,
        defaultUserCreated: true,
        userCount: parseInt(userCount.rows[0].count),
        campaignCount: parseInt(campaignCount.rows[0].count)
      }
    });

  } catch (error) {
    console.error('❌ Database migration failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Database migration failed',
      error: error.message,
      troubleshooting: [
        'Check that your database connection string is correct',
        'Verify your Supabase project is active and accessible',
        'Ensure you have the correct database permissions',
        'Check the Vercel logs for more detailed error information'
      ]
    });
  } finally {
    if (client) {
      try {
        await client.end();
        console.log('✅ Database connection closed');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
} 