#!/usr/bin/env node

/**
 * Production Deployment Script
 * Handles Supabase setup, schema deployment, and data migration
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step} ${message}`, 'cyan');
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

class ProductionDeployer {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.envFile = path.join(this.projectRoot, '.env.local');
    this.envTemplate = path.join(this.projectRoot, 'env.production.template');
  }

  async deploy() {
    try {
      log('🚀 Starting Production Deployment for Campaign Builder', 'bright');
      log('=' .repeat(60), 'cyan');

      await this.checkPrerequisites();
      await this.setupEnvironment();
      await this.setupDatabase();
      await this.runMigrations();
      await this.validateDeployment();
      await this.setupMonitoring();

      log('\n' + '=' .repeat(60), 'cyan');
      log('🎉 Production deployment completed successfully!', 'green');
      this.showNextSteps();

    } catch (error) {
      logError(`Deployment failed: ${error.message}`);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    logStep('🔍', 'Checking prerequisites...');

    // Check if Node.js version is compatible
    const nodeVersion = process.version;
    log(`Node.js version: ${nodeVersion}`);

    // Check if required commands are available
    const commands = ['npm', 'npx'];
    for (const cmd of commands) {
      try {
        execSync(`which ${cmd}`, { stdio: 'ignore' });
        logSuccess(`${cmd} is available`);
      } catch (error) {
        throw new Error(`${cmd} is not installed or not in PATH`);
      }
    }

    // Check if package.json exists
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found');
    }
    logSuccess('package.json found');

    // Check if Prisma is installed
    try {
      execSync('npx prisma --version', { stdio: 'ignore' });
      logSuccess('Prisma CLI is available');
    } catch (error) {
      throw new Error('Prisma CLI not available. Run: npm install');
    }
  }

  async setupEnvironment() {
    logStep('⚙️', 'Setting up environment configuration...');

    if (!fs.existsSync(this.envFile)) {
      if (fs.existsSync(this.envTemplate)) {
        log('Creating .env.local from template...');
        fs.copyFileSync(this.envTemplate, this.envFile);
        logWarning('Please edit .env.local with your actual production values');
        logWarning('Required: DATABASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
        
        // Wait for user confirmation
        log('\nPress Enter after you have configured .env.local...');
        await this.waitForInput();
      } else {
        throw new Error('Environment template not found. Please create .env.local manually.');
      }
    }

    // Validate required environment variables
    const requiredVars = [
      'DATABASE_URL',
      'VITE_SUPABASE_URL', 
      'VITE_SUPABASE_ANON_KEY'
    ];

    const envContent = fs.readFileSync(this.envFile, 'utf8');
    const missingVars = requiredVars.filter(varName => {
      const regex = new RegExp(`^${varName}=.+`, 'm');
      return !regex.test(envContent) || envContent.includes(`[YOUR-`);
    });

    if (missingVars.length > 0) {
      throw new Error(`Missing or incomplete environment variables: ${missingVars.join(', ')}`);
    }

    logSuccess('Environment configuration validated');
  }

  async setupDatabase() {
    logStep('🗄️', 'Setting up production database...');

    try {
      // Copy production schema to main schema file
      const prodSchema = path.join(this.projectRoot, 'prisma', 'production-schema.prisma');
      const mainSchema = path.join(this.projectRoot, 'prisma', 'schema.prisma');
      
      if (fs.existsSync(prodSchema)) {
        log('Using production-optimized schema...');
        fs.copyFileSync(prodSchema, mainSchema);
        logSuccess('Production schema applied');
      }

      // Generate Prisma client
      log('Generating Prisma client...');
      execSync('npx prisma generate', { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      logSuccess('Prisma client generated');

      // Test database connection by validating schema
      log('Validating database schema...');
      execSync('npx prisma validate', { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      logSuccess('Database schema validated');

    } catch (error) {
      throw new Error(`Database setup failed: ${error.message}`);
    }
  }

  async runMigrations() {
    logStep('📊', 'Running database migrations...');

    try {
      // Push schema to database
      log('Pushing schema to production database...');
      execSync('npx prisma db push', { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      logSuccess('Schema deployed to production database');

      // Run data migration if needed
      const migrationScript = path.join(this.projectRoot, 'scripts', 'migrate-localStorage.js');
      if (fs.existsSync(migrationScript)) {
        log('Running data migration from localStorage...');
        execSync(`node "${migrationScript}"`, { 
          cwd: this.projectRoot,
          stdio: 'inherit'
        });
        logSuccess('Data migration completed');
      }

    } catch (error) {
      throw new Error(`Migration failed: ${error.message}`);
    }
  }

  async validateDeployment() {
    logStep('✅', 'Validating deployment...');

    try {
      // Build the application
      log('Building application for production...');
      execSync('npm run build', { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      logSuccess('Application built successfully');

      // Run integration tests
      const testScript = path.join(this.projectRoot, 'scripts', 'test-database-integration.cjs');
      if (fs.existsSync(testScript)) {
        log('Running integration tests...');
        execSync(`node "${testScript}"`, { 
          cwd: this.projectRoot,
          stdio: 'inherit'
        });
        logSuccess('Integration tests passed');
      }

    } catch (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  async setupMonitoring() {
    logStep('📊', 'Setting up monitoring and health checks...');

    // Create health check endpoint info
    const healthCheckInfo = {
      endpoint: '/api/health',
      checks: [
        'Database connectivity',
        'Prisma client status', 
        'Redis cache status',
        'AI service availability'
      ],
      monitoring: {
        database: 'Built-in Supabase monitoring',
        application: 'Vercel Analytics',
        errors: 'Console logging + Vercel Functions'
      }
    };

    log('Health check configuration:');
    console.log(JSON.stringify(healthCheckInfo, null, 2));
    logSuccess('Monitoring setup documented');
  }

  async waitForInput() {
    return new Promise((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
  }

  showNextSteps() {
    log('\n🎯 Next Steps:', 'bright');
    log('1. Deploy to Vercel:', 'yellow');
    log('   vercel --prod', 'cyan');
    log('2. Set environment variables in Vercel dashboard', 'yellow');
    log('3. Test the production deployment', 'yellow');
    log('4. Monitor application health and performance', 'yellow');
    log('\n📚 Documentation:', 'bright');
    log('- Database schema: prisma/production-schema.prisma', 'cyan');
    log('- Environment template: env.production.template', 'cyan');
    log('- Migration status: DATABASE_IMPLEMENTATION_STATUS.md', 'cyan');
  }
}

// Run deployment if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const deployer = new ProductionDeployer();
  deployer.deploy().catch(console.error);
}

export default ProductionDeployer; 