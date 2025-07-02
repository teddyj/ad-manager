/**
 * Health Check API Endpoint
 * Provides comprehensive health monitoring for production deployment
 */

import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
let prisma;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
}

// Health check results cache
let lastHealthCheck = null;
let lastCheckTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return cached result if recent
    const now = Date.now();
    if (lastHealthCheck && (now - lastCheckTime) < CACHE_DURATION) {
      return res.status(lastHealthCheck.status).json(lastHealthCheck.data);
    }

    // Perform health checks
    const healthStatus = await performHealthChecks();
    
    // Cache results
    lastHealthCheck = healthStatus;
    lastCheckTime = now;

    return res.status(healthStatus.status).json(healthStatus.data);

  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function performHealthChecks() {
  const checks = {};
  let overallStatus = 'healthy';
  let httpStatus = 200;

  // 1. Database connectivity check
  try {
    if (prisma) {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      checks.database = {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        message: 'Database connection successful'
      };
    } else {
      checks.database = {
        status: 'error',
        message: 'Prisma client not initialized'
      };
      overallStatus = 'degraded';
    }
  } catch (error) {
    checks.database = {
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    };
    overallStatus = 'unhealthy';
    httpStatus = 503;
  }

  // 2. Environment configuration check
  try {
    const requiredEnvVars = [
      'DATABASE_URL',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      checks.environment = {
        status: 'healthy',
        message: 'All required environment variables present'
      };
    } else {
      checks.environment = {
        status: 'error',
        message: 'Missing required environment variables',
        missing: missingVars
      };
      overallStatus = 'unhealthy';
      httpStatus = 503;
    }
  } catch (error) {
    checks.environment = {
      status: 'error',
      message: 'Environment check failed',
      error: error.message
    };
    overallStatus = 'degraded';
  }

  // 3. Redis cache check (if enabled)
  try {
    if (process.env.REDIS_URL && process.env.VITE_ENABLE_REDIS_CACHE === 'true') {
      // Note: Redis check would require Redis client
      // For now, just check if credentials are present
      checks.redis = {
        status: 'healthy',
        message: 'Redis configuration present'
      };
    } else {
      checks.redis = {
        status: 'disabled',
        message: 'Redis caching not enabled'
      };
    }
  } catch (error) {
    checks.redis = {
      status: 'error',
      message: 'Redis check failed',
      error: error.message
    };
    overallStatus = 'degraded';
  }

  // 4. AI Services check
  try {
    const aiServices = [];
    
    if (process.env.VITE_FAL_API_KEY) {
      aiServices.push('FAL.ai (Background Generation)');
    }
    
    if (process.env.OPENAI_API_KEY) {
      aiServices.push('OpenAI (Copy Generation)');
    }

    checks.aiServices = {
      status: aiServices.length > 0 ? 'healthy' : 'disabled',
      message: aiServices.length > 0 
        ? `AI services configured: ${aiServices.join(', ')}`
        : 'No AI services configured',
      services: aiServices
    };
  } catch (error) {
    checks.aiServices = {
      status: 'error',
      message: 'AI services check failed',
      error: error.message
    };
    overallStatus = 'degraded';
  }

  // 5. Application configuration check
  try {
    const appConfig = {
      nodeVersion: process.version,
      environment: process.env.VITE_APP_ENV || 'development',
      databaseEnabled: process.env.VITE_USE_DATABASE === 'true',
      migrationEnabled: process.env.VITE_MIGRATE_EXISTING_DATA === 'true'
    };

    checks.application = {
      status: 'healthy',
      message: 'Application configuration loaded',
      config: appConfig
    };
  } catch (error) {
    checks.application = {
      status: 'error',
      message: 'Application configuration check failed',
      error: error.message
    };
    overallStatus = 'degraded';
  }

  // 6. Memory and performance check
  try {
    const memoryUsage = process.memoryUsage();
    const memoryMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    };

    const uptime = Math.round(process.uptime());

    checks.performance = {
      status: 'healthy',
      message: 'Performance metrics collected',
      memory: memoryMB,
      uptime: `${uptime} seconds`
    };
  } catch (error) {
    checks.performance = {
      status: 'error',
      message: 'Performance check failed',
      error: error.message
    };
  }

  // Build response
  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION || '1.0.0',
    environment: process.env.VITE_APP_ENV || 'development',
    checks: checks,
    summary: {
      healthy: Object.values(checks).filter(c => c.status === 'healthy').length,
      degraded: Object.values(checks).filter(c => c.status === 'error').length,
      disabled: Object.values(checks).filter(c => c.status === 'disabled').length,
      total: Object.keys(checks).length
    }
  };

  return {
    status: httpStatus,
    data: response
  };
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing database connections...');
  if (prisma) {
    await prisma.$disconnect();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing database connections...');
  if (prisma) {
    await prisma.$disconnect();
  }
  process.exit(0);
}); 