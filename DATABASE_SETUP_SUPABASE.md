# Database Setup with Supabase (No Docker Required)

Since Docker isn't available on your system, we'll use **Supabase** for both local development and production. This is actually a great approach because:

- ✅ **No Docker installation required**
- ✅ **Same database for dev and production**
- ✅ **Built-in authentication and real-time features**
- ✅ **Excellent management dashboard**
- ✅ **Free tier available**

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and create a new project
3. Choose a region close to you
4. Save your project credentials

### 2. Get Database URL

From your Supabase dashboard:
1. Go to **Settings** → **Database**
2. Copy the **Connection String** (URI format)
3. It looks like: `postgresql://postgres:[password]@[host]:5432/postgres`

### 3. Update Environment

Create `.env.local` with your Supabase credentials:

```bash
# Copy the example and update with your Supabase URL
cp env.local.example .env.local
```

Edit `.env.local`:
```env
# Replace with your Supabase database URL
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres"

# Optional: Supabase project details
VITE_SUPABASE_URL="https://[your-project].supabase.co"
VITE_SUPABASE_ANON_KEY="[your-anon-key]"

# Enable database features
VITE_USE_DATABASE=true
VITE_MIGRATE_EXISTING_DATA=true
```

### 4. Setup Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Apply schema to Supabase
npm run db:push

# Seed with test data
npm run db:seed
```

### 5. Start Development

```bash
npm run dev:full
```

Visit http://localhost:3001 - your app now uses Supabase!

## Alternative: Local SQLite (Simplest)

If you want to avoid external dependencies completely, we can use SQLite for local development:

### 1. Update Prisma Schema for SQLite

Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 2. Create Local Environment

```env
# .env.local
DATABASE_URL="file:./dev.db"
VITE_USE_DATABASE=true
```

### 3. Setup SQLite Database

```bash
npm run db:push
npm run db:seed
npm run dev:full
```

**Benefits of SQLite approach:**
- ✅ No external services needed
- ✅ Database file stored locally
- ✅ Perfect for development
- ✅ Easy to reset/backup

## Recommended Development Commands

### Using Supabase
```bash
npm run db:studio       # Local database browser
npm run db:push         # Deploy schema changes
npm run db:seed         # Add test data
npm run status          # Check all services
```

### Database Management
```bash
# View your data
npm run db:studio       # Opens Prisma Studio at localhost:5555

# Reset database
npm run db:reset        # Careful: deletes all data!

# Update schema
# 1. Edit prisma/schema.prisma
# 2. Run: npm run db:push
```

## Migration from localStorage

Your existing localStorage data can be migrated:

```bash
# This will migrate your existing campaigns and products
npm run migrate:localStorage
```

## Supabase Dashboard Features

Your Supabase dashboard provides:

1. **Table Editor**: Visual database browser
2. **SQL Editor**: Run custom queries  
3. **Auth Management**: User authentication
4. **Real-time**: Live data updates
5. **Storage**: File uploads
6. **Edge Functions**: Serverless functions

Access at: `https://app.supabase.com/project/[your-project-id]`

## Development Workflow

### Daily Development
```bash
npm run dev:full        # Start app with database
npm run db:studio       # Browse data locally
```

### Schema Changes
1. Edit `prisma/schema.prisma`
2. Run `npm run db:push`
3. Changes applied to Supabase instantly

### Data Management
```bash
npm run db:seed         # Add test data
npm run db:studio       # Browse/edit data
```

## Production Deployment

When ready for production:

1. **Same Database**: Your Supabase project works for both dev and production
2. **Environment Variables**: Use production URL in production `.env`
3. **Deploy**: Use your existing `npm run deploy:prod` script

## Troubleshooting

### Database Connection Issues

**Problem**: "Database connection failed"
```bash
# Check your DATABASE_URL in .env.local
cat .env.local

# Test connection
npm run db:studio
```

**Problem**: "Schema sync failed"
```bash
# Force schema push
npm run db:push --force-reset
```

### Supabase Issues

**Problem**: "Invalid project URL"
- Check your Supabase project is active
- Verify the DATABASE_URL format
- Ensure your IP is allowed (Supabase → Settings → Network)

## Next Steps

1. ✅ **Database working**: You now have professional database setup
2. 🎯 **Remove localStorage**: Update data services to use database only
3. 🔐 **Add Authentication**: Use Supabase Auth for user management
4. 🚀 **Deploy**: Use the same Supabase project for production

## Why This Approach Works Better

- **Professional Setup**: Same tools used by thousands of companies
- **Scalable**: Supabase scales from development to enterprise
- **Feature Rich**: Authentication, real-time, storage included
- **No Maintenance**: Supabase handles database management
- **Cost Effective**: Free tier generous for development

Let's get your database setup with Supabase! 🚀 