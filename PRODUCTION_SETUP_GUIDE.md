# Production Setup Guide 🚀

This guide walks you through deploying the Campaign Builder application to production with a Supabase database backend.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Git repository access
- ✅ Supabase account (free tier available)
- ✅ Vercel account (free tier available)

## 🎯 Phase 4: Production Deployment Steps

### Step 1: Create Supabase Project

1. **Sign up/Login to Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Create account or sign in
   - Click "New Project"

2. **Project Configuration**
   ```
   Organization: [Your Organization]
   Project Name: campaign-builder-prod
   Database Password: [Strong Password - Save This!]
   Region: [Choose closest to your users]
   ```

3. **Get Project Details**
   After project creation, go to Settings > API:
   - Project URL: `https://[project-ref].supabase.co`
   - Anon Key: `eyJ...` (public key)
   - Service Role Key: `eyJ...` (secret key)

### Step 2: Configure Environment

1. **Copy Environment Template**
   ```bash
   cp env.production.template .env.local
   ```

2. **Fill in Supabase Credentials**
   Edit `.env.local` with your Supabase details:
   ```env
   # Replace [YOUR-PROJECT-REF] with your actual project reference
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public&pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
   
   VITE_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
   VITE_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
   SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
   ```

3. **Configure Feature Flags**
   ```env
   VITE_USE_DATABASE=true
   VITE_MIGRATE_EXISTING_DATA=true
   VITE_SHOW_MIGRATION_UI=false
   ```

### Step 3: Deploy Database Schema

1. **Run Production Deployment Script**
   ```bash
   node scripts/deploy-production.js
   ```
   
   This script will:
   - ✅ Check prerequisites
   - ✅ Validate environment configuration
   - ✅ Deploy optimized schema to Supabase
   - ✅ Generate Prisma client
   - ✅ Test database connection
   - ✅ Run data migration
   - ✅ Build and validate application

2. **Manual Schema Deployment (Alternative)**
   ```bash
   # Copy production schema
   cp prisma/production-schema.prisma prisma/schema.prisma
   
   # Generate Prisma client
   npx prisma generate
   
   # Deploy schema to database
   npx prisma db push
   
   # Test connection
   npx prisma db ping
   ```

### Step 4: Data Migration

1. **Migrate Existing Data** (if you have localStorage data)
   ```bash
   node scripts/migrate-localStorage.js
   ```

2. **Verify Migration**
   - Check Supabase dashboard > Table Editor
   - Verify data appears in products, campaigns tables
   - Test application locally with production database

### Step 5: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Application**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables in Vercel**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add all variables from your `.env.local` file
   - Set Environment: Production

### Step 6: Configure Supabase Authentication (Optional)

1. **Enable Authentication**
   - Supabase Dashboard > Authentication > Settings
   - Configure providers (Email, Google, etc.)

2. **Set up Row Level Security (RLS)**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
   
   -- Create policies (example for products table)
   CREATE POLICY "Users can view own products" ON products
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can create own products" ON products
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

## 🔧 Configuration Options

### Feature Flags

| Flag | Production Value | Description |
|------|------------------|-------------|
| `VITE_USE_DATABASE` | `true` | Enable database operations |
| `VITE_MIGRATE_EXISTING_DATA` | `true` | Migrate localStorage data |
| `VITE_SHOW_MIGRATION_UI` | `false` | Hide migration UI in production |
| `VITE_ENABLE_REDIS_CACHE` | `true` | Enable Redis caching |
| `VITE_ENABLE_FILE_UPLOADS` | `true` | Enable file upload to Supabase Storage |

### Performance Settings

```env
VITE_ENABLE_SERVICE_WORKER=true
VITE_ENABLE_COMPRESSION=true
VITE_LOG_LEVEL=error
```

### Monitoring & Analytics

```env
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

## 📊 Health Monitoring

### Built-in Health Checks

The application includes health monitoring for:
- ✅ Database connectivity
- ✅ Prisma client status
- ✅ Redis cache availability
- ✅ AI service connectivity

### Monitoring Endpoints

- **Health Check**: `https://your-app.vercel.app/api/health`
- **Database Status**: Built into Supabase dashboard
- **Application Metrics**: Vercel Analytics

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```
   Error: Database connection failed
   ```
   **Solution**: Check DATABASE_URL format and credentials

2. **Prisma Client Not Generated**
   ```
   Error: Cannot find module '@prisma/client'
   ```
   **Solution**: Run `npx prisma generate`

3. **Schema Push Failed**
   ```
   Error: Schema push failed
   ```
   **Solution**: Check database permissions and connection

4. **Environment Variables Missing**
   ```
   Error: Missing required environment variables
   ```
   **Solution**: Verify all required vars in `.env.local`

### Debug Commands

```bash
# Test database connection
npx prisma db ping

# Check schema status
npx prisma db status

# View database in browser
npx prisma studio

# Test integration
node scripts/test-database-integration.cjs
```

## 🔐 Security Checklist

- ✅ Database password is strong and secure
- ✅ Service role key is kept secret
- ✅ Environment variables are properly configured
- ✅ Row Level Security (RLS) is enabled
- ✅ API keys are not exposed in client code
- ✅ CORS settings are properly configured

## 📈 Performance Optimization

### Database Optimization

- ✅ Proper indexing on frequently queried columns
- ✅ Connection pooling via PgBouncer
- ✅ Optimized queries with Prisma
- ✅ Redis caching for frequently accessed data

### Application Optimization

- ✅ Code splitting and lazy loading
- ✅ Image optimization and compression
- ✅ Service worker for offline functionality
- ✅ CDN delivery via Vercel Edge Network

## 🚀 Post-Deployment

### Immediate Actions

1. **Test Core Functionality**
   - Create a new campaign
   - Upload product images
   - Test background generation
   - Verify data persistence

2. **Monitor Performance**
   - Check Vercel deployment logs
   - Monitor Supabase dashboard
   - Verify health check endpoints

3. **Set up Alerts**
   - Database connection monitoring
   - Error rate monitoring
   - Performance degradation alerts

### Ongoing Maintenance

- **Regular Backups**: Supabase provides automatic backups
- **Performance Monitoring**: Use Vercel Analytics and Supabase insights
- **Security Updates**: Keep dependencies updated
- **Cost Monitoring**: Monitor Supabase and Vercel usage

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Campaign Builder Database Schema](./prisma/production-schema.prisma)

---

## 🎉 Success Criteria

Your production deployment is successful when:

- ✅ Application loads without errors
- ✅ Database operations work correctly
- ✅ Data persists between sessions
- ✅ File uploads work properly
- ✅ Background generation functions
- ✅ Performance is acceptable
- ✅ Health checks pass

**Congratulations! Your Campaign Builder is now running in production! 🚀** 