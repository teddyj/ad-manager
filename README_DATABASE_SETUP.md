# Database Setup for Local Development

This guide will help you set up the Campaign Builder with a local PostgreSQL database for development.

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js 18+ and npm

### One-Command Setup
```bash
npm run dev:setup
```

This will:
1. ✅ Start PostgreSQL and Redis containers
2. ✅ Set up environment configuration  
3. ✅ Run database migrations
4. ✅ Seed database with test data
5. ✅ Display connection information

### Start Development
```bash
npm run dev:full
```

Visit http://localhost:3001 to see your app with database integration!

## Manual Setup (Step by Step)

If you prefer to understand each step or troubleshoot issues:

### 1. Copy Environment File
```bash
cp env.local.example .env.local
```

### 2. Start Database Containers
```bash
npm run dev:db
```

### 3. Run Migrations
```bash
npm run db:migrate
```

### 4. Seed Test Data
```bash
npm run db:seed
```

### 5. Start Application
```bash
npm run dev:full
```

## Available Commands

### Database Management
```bash
npm run dev:db          # Start database containers
npm run dev:db:stop     # Stop database containers  
npm run dev:db:reset    # Reset containers (clean slate)
npm run dev:db:logs     # View database logs
npm run dev:tools       # Start PgAdmin (database UI)
```

### Development
```bash
npm run dev             # Start frontend only
npm run dev:full        # Start frontend + backend
npm run dev:complete    # Full setup + start everything
npm run status          # Check status of all services
```

### Database Operations
```bash
npm run db:studio       # Open Prisma Studio (database UI)
npm run db:reset        # Reset database schema
npm run db:seed         # Add test data
npm run db:generate     # Generate Prisma client
```

## Connection Information

### Database
- **URL**: `postgresql://dev_user:dev_password@localhost:5432/campaign_builder_dev`
- **Host**: `localhost:5432`
- **Database**: `campaign_builder_dev`
- **Username**: `dev_user`
- **Password**: `dev_password`

### Redis Cache
- **URL**: `redis://localhost:6379`

### Database Management UIs

#### Prisma Studio (Recommended)
```bash
npm run db:studio
```
- Opens at: http://localhost:5555
- Beautiful, easy-to-use database browser
- Perfect for viewing and editing data

#### PgAdmin (Advanced)
```bash
npm run dev:tools
```
- Opens at: http://localhost:5050
- Email: `admin@campaign-builder.local`
- Password: `admin123`
- More advanced PostgreSQL administration

## Troubleshooting

### Docker Issues

**Problem**: "Docker is not installed or not running"
```bash
# Solution: Install and start Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/
```

**Problem**: "Port 5432 is already in use"
```bash
# Solution: Stop existing PostgreSQL or change port
brew services stop postgresql  # If using Homebrew PostgreSQL
# Or edit docker-compose.dev.yml to use different port
```

### Database Connection Issues

**Problem**: "Database connection failed"
```bash
# Check if containers are running
docker ps

# Check database logs
npm run dev:db:logs

# Restart containers
npm run dev:db:reset
```

**Problem**: "Migration failed"
```bash
# Reset and try again
npm run db:reset
npm run db:migrate
```

### Environment Issues

**Problem**: "Environment variables not loaded"
```bash
# Make sure .env.local exists
ls -la .env.local

# Copy from example if missing
cp env.local.example .env.local
```

## Development Workflow

### Daily Development
1. **Start database** (if not running): `npm run dev:db`
2. **Start application**: `npm run dev:full`
3. **View data**: `npm run db:studio`

### Clean Slate Testing
1. **Reset everything**: `npm run dev:db:reset`
2. **Setup fresh**: `npm run dev:setup`
3. **Start development**: `npm run dev:full`

### Working with Data

#### Viewing Data
```bash
npm run db:studio    # Best for browsing data
npm run dev:tools    # Advanced SQL queries
```

#### Modifying Schema
1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Schema changes applied to database

#### Adding Test Data
1. Edit `prisma/seed.js`
2. Run `npm run db:seed`
3. New test data added

## Database Schema Overview

The database includes tables for:

- **Users**: User profiles and authentication
- **Products**: Product catalogs per user
- **Campaigns**: Campaign data with user ownership
- **Creatives**: Ad creatives and assets
- **Platform Integrations**: Meta, Google, TikTok connections

All data is properly scoped to users, supporting multi-user functionality.

## Migration from localStorage

Your existing localStorage data can be migrated to the database:

```bash
npm run migrate:localStorage
```

This will:
1. Create a default user
2. Migrate all products and campaigns
3. Preserve data relationships
4. Keep legacy IDs for reference

## Performance Features

- **Intelligent Caching**: Frequently accessed data cached in memory
- **Optimized Queries**: Proper indexing for fast lookups
- **Connection Pooling**: Efficient database connection management
- **Background Sync**: Offline operations queued and synced

## Security Features

- **User Data Isolation**: Each user sees only their data
- **Environment Variables**: Sensitive data in .env files
- **Development Safety**: Separate dev database from production

## Next Steps

1. **Set up authentication**: Add user login/signup
2. **Add team features**: Multi-user collaboration
3. **Implement platform APIs**: Real integrations with Meta, Google, etc.
4. **Add analytics**: Track campaign performance
5. **Deploy to production**: Use the production deployment guide

## Need Help?

- **Database Issues**: Check the logs with `npm run dev:db:logs`
- **Schema Questions**: Explore with `npm run db:studio`
- **Performance**: Monitor with health checks at `/api/health`
- **General Support**: Check the troubleshooting section above

Happy coding! 🚀 