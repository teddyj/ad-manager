#!/usr/bin/env node

/**
 * Setup Production Database Script
 * Pushes Prisma schema to Supabase database
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function setupProductionDatabase() {
  try {
    log('🚀 Setting up Production Database Schema', 'bright');
    log('=' .repeat(50), 'cyan');

    const projectRoot = path.resolve(__dirname, '..');
    
    // Check if DATABASE_URL is set
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    log(`🔗 Using database: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}`);

    // Generate Prisma client
    log('\n📦 Generating Prisma client...');
    execSync('npx prisma generate', { 
      cwd: projectRoot,
      stdio: 'inherit'
    });
    logSuccess('Prisma client generated');

    // Validate schema
    log('\n🔍 Validating database schema...');
    execSync('npx prisma validate', { 
      cwd: projectRoot,
      stdio: 'inherit'
    });
    logSuccess('Database schema validated');

    // Push schema to database
    log('\n🗄️  Pushing schema to production database...');
    execSync('npx prisma db push --accept-data-loss', { 
      cwd: projectRoot,
      stdio: 'inherit'
    });
    logSuccess('Schema deployed to production database');

    // Create default user
    log('\n👤 Creating default user...');
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      // Check if default user exists
      const existingUser = await prisma.user.findFirst({
        where: { id: '00000000-0000-0000-0000-000000000001' }
      });
      
      if (!existingUser) {
        await prisma.user.create({
          data: {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'default@example.com',
            name: 'Default User',
            settings: {}
          }
        });
        logSuccess('Default user created');
      } else {
        logSuccess('Default user already exists');
      }
      
      await prisma.$disconnect();
    } catch (error) {
      logWarning(`Could not create default user: ${error.message}`);
      log('You can create it manually later if needed');
    }

    log('\n' + '=' .repeat(50), 'cyan');
    log('🎉 Production database setup completed successfully!', 'green');
    log('\nNext steps:', 'bright');
    log('1. Test your application at https://ad-manager-gamma.vercel.app');
    log('2. Try creating a campaign to verify database connectivity');
    log('3. Check your Supabase dashboard to see the created tables');

  } catch (error) {
    logError(`Database setup failed: ${error.message}`);
    log('\nTroubleshooting:', 'yellow');
    log('1. Verify your DATABASE_URL is correct');
    log('2. Check your Supabase project is active');
    log('3. Ensure you have the correct permissions');
    process.exit(1);
  }
}

// Run the setup
setupProductionDatabase(); 