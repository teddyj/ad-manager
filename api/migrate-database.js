/**
 * Database Schema Deployment API Endpoint
 * This endpoint deploys the Prisma schema to Supabase database
 * Following the established database-first strategy
 */

import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting Prisma schema deployment...');

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

    // Test Supabase connection first
    console.log('🔍 Testing Supabase connection...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Simple connection test
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (testError) {
      console.error('Supabase connection test failed:', testError);
      throw new Error(`Supabase connection failed: ${testError.message}`);
    }

    console.log('✅ Supabase connection successful');

    // Set up DATABASE_URL for Prisma
    const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('No DATABASE_URL found. Expected POSTGRES_PRISMA_URL, POSTGRES_URL, or DATABASE_URL');
    }

    console.log('📊 Deploying Prisma schema to database...');
    
    // Use Prisma to push schema (this is the established approach)
    try {
      // Set environment variable for this process
      process.env.DATABASE_URL = databaseUrl;
      
      // Run Prisma db push to create tables
      console.log('Running: npx prisma db push --accept-data-loss');
      execSync('npx prisma db push --accept-data-loss', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: databaseUrl }
      });
      
      console.log('✅ Prisma schema deployed successfully');
      
    } catch (execError) {
      console.error('Prisma deployment failed:', execError);
      throw new Error(`Prisma deployment failed: ${execError.message}`);
    }

    // Create default user using Supabase client
    console.log('👤 Creating default user...');
    const defaultUserId = '00000000-0000-0000-0000-000000000001';
    
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', defaultUserId)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.log('User check error:', userCheckError);
    }

    if (!existingUser) {
      const { data: newUser, error: userCreateError } = await supabase
        .from('users')
        .insert({
          id: defaultUserId,
          email: 'default@example.com',
          name: 'Default User',
          settings: {}
        })
        .select()
        .single();

      if (userCreateError) {
        console.log('User creation error:', userCreateError);
        throw new Error(`Failed to create default user: ${userCreateError.message}`);
      }
      
      console.log('✅ Default user created:', newUser.id);
    } else {
      console.log('✅ Default user already exists');
    }

    // Test the setup by counting records
    console.log('🧪 Testing database setup...');
    const { count: userCount, error: userCountError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: campaignCount, error: campaignCountError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    if (userCountError || campaignCountError) {
      console.log('Count errors:', { userCountError, campaignCountError });
    }

    console.log(`✅ Found ${userCount || 0} users and ${campaignCount || 0} campaigns`);
    console.log('🎉 Database migration completed successfully!');

    res.status(200).json({
      success: true,
      message: 'Database migration completed successfully',
      details: {
        schemaDeployed: true,
        defaultUserCreated: !existingUser,
        userCount: userCount || 0,
        campaignCount: campaignCount || 0,
        supabaseUrl: supabaseUrl,
        tablesCreated: true
      }
    });

  } catch (error) {
    console.error('❌ Database migration failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Database migration failed',
      error: error.message,
      troubleshooting: [
        'Check that your Supabase credentials are correct in Vercel environment',
        'Verify your Supabase project is active and accessible',
        'Ensure POSTGRES_PRISMA_URL or DATABASE_URL is set correctly',
        'Check the Vercel function logs for more detailed error information',
        'Make sure Prisma schema is valid and up to date'
      ]
    });
  }
} 