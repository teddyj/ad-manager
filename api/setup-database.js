/**
 * Database Setup API Endpoint
 * This endpoint sets up the database schema in production
 * Call this once after deployment to initialize the database
 */

import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
let prisma;

try {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
      }
    }
  });
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting database setup...');

    // Check if we have a database connection
    if (!prisma) {
      throw new Error('Database client not initialized');
    }

    // Test database connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if tables exist by trying to count users
    console.log('🔍 Checking if tables exist...');
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Tables exist. Found ${userCount} users`);
    } catch (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('❌ Tables do not exist. This is expected for first-time setup.');
        console.log('ℹ️  You need to run "npx prisma db push" to create the tables.');
        
        return res.status(200).json({
          success: false,
          message: 'Database tables do not exist. Please run schema migration.',
          error: 'Tables not found',
          instructions: [
            'The database connection is working, but tables need to be created.',
            'You need to run "npx prisma db push" with your production DATABASE_URL.',
            'This is a one-time setup step that creates all the required tables.',
            'After running the migration, campaigns will be saved to the database.'
          ]
        });
      }
      throw error;
    }

    // Create default user if it doesn't exist
    console.log('👤 Checking for default user...');
    const defaultUserId = '00000000-0000-0000-0000-000000000001';
    
    let defaultUser = await prisma.user.findUnique({
      where: { id: defaultUserId }
    });

    if (!defaultUser) {
      console.log('👤 Creating default user...');
      defaultUser = await prisma.user.create({
        data: {
          id: defaultUserId,
          email: 'default@example.com',
          name: 'Default User',
          settings: {}
        }
      });
      console.log('✅ Default user created');
    } else {
      console.log('✅ Default user already exists');
    }

    // Test campaign creation
    console.log('🧪 Testing campaign creation...');
    const testCampaign = await prisma.campaign.create({
      data: {
        userId: defaultUserId,
        name: 'Database Setup Test Campaign',
        type: 'test',
        status: 'draft',
        legacyData: {
          test: true,
          createdBy: 'database-setup-api'
        }
      }
    });
    console.log('✅ Test campaign created:', testCampaign.id);

    // Clean up test campaign
    await prisma.campaign.delete({
      where: { id: testCampaign.id }
    });
    console.log('✅ Test campaign cleaned up');

    console.log('🎉 Database setup completed successfully!');

    res.status(200).json({
      success: true,
      message: 'Database setup completed successfully',
      details: {
        defaultUser: {
          id: defaultUser.id,
          email: defaultUser.email,
          name: defaultUser.name
        },
        tablesVerified: true,
        testPassed: true
      }
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Database setup failed',
      error: error.message,
      troubleshooting: [
        'Check that your DATABASE_URL or POSTGRES_PRISMA_URL is set correctly',
        'Verify your Supabase project is active and accessible',
        'Ensure you have the correct database permissions',
        'Check the Vercel logs for more detailed error information'
      ]
    });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
} 