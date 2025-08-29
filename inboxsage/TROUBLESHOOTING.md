# InboxSage Troubleshooting Guide

## ✅ Issues Fixed

### 1. **Tailwind CSS PostCSS Error**
- **Issue**: `Error: It looks like you're trying to use tailwindcss directly as a PostCSS plugin`
- **Solution**: Fixed PostCSS configuration and removed incompatible @tailwindcss/postcss package
- **Status**: ✅ RESOLVED

### 2. **NextAuth Configuration Error**
- **Issue**: `signUp does not exist in type 'Partial<PagesOptions>'`
- **Solution**: Removed invalid `signUp` property from NextAuth pages config
- **Status**: ✅ RESOLVED

### 3. **Next.js Configuration Warnings**
- **Issue**: Invalid `appDir` and `outputFileTracingRoot` options
- **Solution**: Removed deprecated configuration options
- **Status**: ✅ RESOLVED

## 🚀 Vercel Deployment Guide

### Step 1: Repository Setup
1. Push your code to GitHub/GitLab/Bitbucket
2. Ensure all files are committed including:
   - `package.json`
   - `next.config.js`
   - `vercel.json`
   - `.env.example`

### Step 2: Vercel Project Creation
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your repository
4. Vercel will auto-detect Next.js

### Step 3: Environment Variables
Add these required environment variables in Vercel dashboard:

```env
# Database (Use Vercel Postgres or external provider)
DATABASE_URL=postgresql://username:password@host:port/database

# NextAuth.js
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-random-32-character-secret

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# Resend Email
RESEND_API_KEY=re_your-resend-api-key

# Application
APP_URL=https://your-domain.vercel.app
ADMIN_EMAIL=admin@yourdomain.com
ENABLE_CRON_JOBS=true
```

### Step 4: Database Setup
Choose one of these options:

#### Option A: Vercel Postgres (Recommended)
1. In Vercel dashboard, go to Storage tab
2. Create new Postgres database
3. Copy connection string to `DATABASE_URL`

#### Option B: External Provider
1. Use Supabase, PlanetScale, or Railway
2. Create database and get connection string
3. Add to environment variables

### Step 5: Database Migration
After deployment, run migrations:
1. Install Vercel CLI: `npm i -g vercel`
2. Connect to project: `vercel link`
3. Run migrations: `vercel env pull .env.local && npx prisma migrate deploy`

## 🔧 Common Deployment Issues

### Issue: 404 NOT_FOUND on Vercel
**Causes & Solutions:**

1. **Missing Environment Variables**
   - Ensure all required env vars are set
   - Check NEXTAUTH_URL matches your domain

2. **Database Connection**
   - Verify DATABASE_URL is correct
   - Ensure database is accessible from Vercel

3. **Build Errors**
   - Check build logs in Vercel dashboard
   - Fix any TypeScript or import errors

4. **NextAuth Configuration**
   - Ensure NEXTAUTH_SECRET is set
   - Verify NEXTAUTH_URL is correct

### Issue: Database Connection Errors
**Solutions:**
1. Check connection string format
2. Ensure database allows external connections
3. Run `npx prisma generate` before deployment

### Issue: API Routes Not Working
**Solutions:**
1. Verify file structure in `src/app/api/`
2. Check for import errors
3. Ensure environment variables are accessible

## 🧪 Local Testing

### Test Database Connection
```bash
cd inboxsage
npx prisma generate
npx prisma db push
```

### Test Build Process
```bash
npm run build
npm start
```

### Test API Endpoints
1. Start development server: `npm run dev`
2. Test registration: POST to `/api/auth/register`
3. Test authentication: Visit `/api/auth/signin`

## 📊 Performance Optimization

### For Vercel Deployment:
1. **Function Regions**: Configure closest to your users
2. **Edge Runtime**: Use for API routes where possible
3. **Database**: Use connection pooling
4. **Caching**: Implement Redis for sessions

### Build Optimization:
```javascript
// next.config.js
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
}
```

## 🔍 Debug Commands

### Check Current Issues:
```bash
# Build the project
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Lint the code
npm run lint

# Check database connection
npx prisma studio
```

### Environment Validation:
```bash
# Check if all env vars are loaded
node -e "console.log(process.env.DATABASE_URL ? '✓ DB' : '✗ DB Missing')"
node -e "console.log(process.env.NEXTAUTH_SECRET ? '✓ Auth' : '✗ Auth Missing')"
```

## 📞 Support

If you encounter issues not covered here:

1. **Check Vercel Logs**: Function logs in Vercel dashboard
2. **Database Logs**: Monitor database connection issues
3. **Browser Console**: Check for client-side errors
4. **Network Tab**: Verify API calls are reaching server

## 🎯 Quick Fixes

### Reset Everything:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate database client
npx prisma generate

# Restart development server
npm run dev
```

### Emergency Deployment Fix:
1. Check Vercel function logs
2. Verify all environment variables
3. Ensure database is accessible
4. Test build locally first

---

**Status**: All major issues have been resolved. The application should now deploy successfully to Vercel! 🚀