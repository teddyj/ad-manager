/**
 * Database Setup Information API Endpoint
 * This endpoint provides the SQL commands needed to set up the database
 * Since we can't execute SQL directly, this provides instructions
 */

import { createClient } from '@supabase/supabase-js';

// Essential tables SQL that needs to be run in Supabase SQL Editor
const SETUP_SQL = `-- Essential tables for Campaign Builder
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_source ON campaigns(source);
CREATE INDEX IF NOT EXISTS idx_campaigns_legacy_id ON campaigns(legacy_id);

-- Create default user
INSERT INTO users (id, email, name, settings) 
VALUES ('00000000-0000-0000-0000-000000000001', 'default@example.com', 'Default User', '{}')
ON CONFLICT (id) DO NOTHING;`;

export default async function handler(req, res) {
  try {
    console.log('🔍 Checking database setup status...');

    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      const availableEnvVars = Object.keys(process.env).filter(key => 
        key.includes('SUPABASE') || key.includes('POSTGRES') || key.includes('DATABASE')
      );
      console.log('Available env vars:', availableEnvVars);
      throw new Error('Missing Supabase credentials. Expected SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }

    console.log('🔗 Testing Supabase connection...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if tables exist by attempting to query them directly
    let tablesExist = false;
    let userCount = 0;
    let campaignCount = 0;
    let setupNeeded = true;
    let errorDetails = [];

    // Test campaigns table
    try {
      console.log('Testing campaigns table...');
      const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true });

      if (campaignError) {
        console.log('❌ Campaigns table error:', campaignError.message);
        errorDetails.push(`Campaigns table: ${campaignError.message}`);
      } else {
        console.log('✅ Campaigns table exists');
        campaignCount = campaigns || 0;
      }
    } catch (error) {
      console.log('❌ Campaigns table error:', error.message);
      errorDetails.push(`Campaigns table: ${error.message}`);
    }

    // Test users table
    try {
      console.log('Testing users table...');
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (userError) {
        console.log('❌ Users table error:', userError.message);
        errorDetails.push(`Users table: ${userError.message}`);
      } else {
        console.log('✅ Users table exists');
        userCount = users || 0;
      }
    } catch (error) {
      console.log('❌ Users table error:', error.message);
      errorDetails.push(`Users table: ${error.message}`);
    }

    // Only consider setup complete if both tables exist without errors
    if (errorDetails.length === 0) {
      tablesExist = true;
      setupNeeded = false;
    }

    if (setupNeeded) {
      console.log('📋 Database setup is needed');
      
      const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
      
      res.status(200).json({
        success: false,
        setupNeeded: true,
        message: 'Database tables need to be created',
        errors: errorDetails,
        instructions: {
          step1: 'Go to your Supabase project dashboard',
          step2: 'Navigate to SQL Editor',
          step3: 'Copy and paste the SQL below',
          step4: 'Click "Run" to execute the SQL',
          step5: 'Call this endpoint again to verify setup'
        },
        sql: SETUP_SQL,
        supabaseUrl: supabaseUrl,
        dashboardUrl: `https://app.supabase.com/project/${projectId}`,
        sqlEditorUrl: `https://app.supabase.com/project/${projectId}/sql`
      });
    } else {
      console.log('✅ Database is properly set up');
      
      res.status(200).json({
        success: true,
        setupNeeded: false,
        message: 'Database is properly configured',
        details: {
          tablesExist: true,
          userCount: userCount,
          campaignCount: campaignCount,
          supabaseUrl: supabaseUrl
        },
        nextSteps: [
          'Your database is ready!',
          'Try creating a campaign at https://ad-manager-gamma.vercel.app',
          'Campaigns should now save to the database and persist across sessions'
        ]
      });
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Database check failed',
      error: error.message,
      troubleshooting: [
        'Check that your Supabase credentials are correct in Vercel environment',
        'Verify your Supabase project is active and accessible',
        'Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Vercel'
      ]
    });
  }
} 