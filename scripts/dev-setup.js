#!/usr/bin/env node

/**
 * Development Setup Script
 * 
 * This script sets up the complete local development environment:
 * - Starts Docker containers for PostgreSQL and Redis
 * - Waits for database to be ready
 * - Runs database migrations
 * - Seeds the database with test data
 * - Displays connection information
 */

import { execSync, spawn } from 'child_process';
import { setTimeout } from 'timers/promises';
import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(icon, message) {
  log(`${icon} ${message}`, colors.cyan);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

async function checkPrerequisites() {
  logStep('🔍', 'Checking prerequisites...');
  
  try {
    execSync('docker --version', { stdio: 'pipe' });
    logSuccess('Docker is installed');
  } catch (error) {
    logError('Docker is not installed or not running');
    logError('Please install Docker Desktop and make sure it\'s running');
    process.exit(1);
  }

  try {
    execSync('docker-compose --version', { stdio: 'pipe' });
    logSuccess('Docker Compose is available');
  } catch (error) {
    logError('Docker Compose is not available');
    process.exit(1);
  }
}

async function setupEnvironment() {
  logStep('📝', 'Setting up environment file...');
  
  const envLocalPath = '.env.local';
  const envExamplePath = 'env.local.example';
  
  if (!fs.existsSync(envLocalPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envLocalPath);
      logSuccess('Created .env.local from example');
    } else {
      logWarning('.env.local.example not found, you may need to create .env.local manually');
    }
  } else {
    logSuccess('.env.local already exists');
  }
}

async function startDatabaseContainers() {
  logStep('🐳', 'Starting database containers...');
  
  try {
    execSync('docker-compose -f docker-compose.dev.yml up -d', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    logSuccess('Database containers started');
  } catch (error) {
    logError('Failed to start database containers');
    throw error;
  }
}

async function waitForDatabase() {
  logStep('⏳', 'Waiting for database to be ready...');
  
  const maxAttempts = 30;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      execSync('docker exec campaign-builder-postgres pg_isready -U dev_user -d campaign_builder_dev', { 
        stdio: 'pipe' 
      });
      logSuccess('Database is ready');
      return;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        logError('Database failed to start within expected time');
        throw error;
      }
      process.stdout.write('.');
      await setTimeout(2000);
    }
  }
}

async function runMigrations() {
  logStep('🗃️', 'Running database migrations...');
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    logSuccess('Prisma client generated');
    
    execSync('npx prisma db push', { stdio: 'inherit' });
    logSuccess('Database schema applied');
  } catch (error) {
    logError('Failed to run migrations');
    throw error;
  }
}

async function seedDatabase() {
  logStep('🌱', 'Seeding database with test data...');
  
  try {
    execSync('npm run db:seed', { stdio: 'inherit' });
    logSuccess('Database seeded successfully');
  } catch (error) {
    logWarning('Database seeding failed, continuing anyway...');
    console.log('You can run "npm run db:seed" manually later');
  }
}

function displayConnectionInfo() {
  log('\n🎉 Development environment setup complete!', colors.green);
  log('\n📊 Connection Information:', colors.cyan);
  log('   Database: postgresql://dev_user:dev_password@localhost:5432/campaign_builder_dev');
  log('   Redis: redis://localhost:6379');
  log('   PgAdmin: http://localhost:5050 (run "npm run dev:tools" to start)');
  
  log('\n🚀 Quick Start Commands:', colors.cyan);
  log('   npm run dev:full     # Start frontend + backend');
  log('   npm run dev          # Start frontend only');
  log('   npm run db:studio    # Open database management UI');
  log('   npm run status       # Check all services status');
  
  log('\n🛠️  Database Management:', colors.cyan);
  log('   npm run db:reset     # Reset database to clean state');
  log('   npm run db:seed      # Add test data');
  log('   npm run dev:db:reset # Reset Docker containers');
  
  log('\n💡 Next Steps:', colors.yellow);
  log('   1. Run "npm run dev:full" to start the application');
  log('   2. Visit http://localhost:3001 to see your app');
  log('   3. Use "npm run db:studio" to manage database data');
}

async function main() {
  try {
    console.log('🚀 Campaign Builder Development Setup\n');
    
    await checkPrerequisites();
    await setupEnvironment();
    await startDatabaseContainers();
    await waitForDatabase();
    await runMigrations();
    await seedDatabase();
    
    displayConnectionInfo();
    
  } catch (error) {
    logError('Setup failed');
    console.error(error);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Campaign Builder Development Setup');
  console.log('');
  console.log('Usage: npm run dev:setup');
  console.log('       node scripts/dev-setup.js');
  console.log('');
  console.log('This script will:');
  console.log('  1. Check for Docker prerequisites');
  console.log('  2. Start PostgreSQL and Redis containers');
  console.log('  3. Set up environment configuration');
  console.log('  4. Run database migrations');
  console.log('  5. Seed database with test data');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h    Show this help message');
  process.exit(0);
}

main(); 