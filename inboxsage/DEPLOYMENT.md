# Vercel Deployment Configuration

## Environment Variables Required:

### Database
- `DATABASE_URL`: PostgreSQL connection string
- Example: `postgresql://username:password@host:port/database`

### Authentication
- `NEXTAUTH_URL`: Your production URL (e.g., https://yourdomain.com)
- `NEXTAUTH_SECRET`: Random string for JWT encryption

### AI Integration  
- `OPENAI_API_KEY`: Your OpenAI API key for content summarization

### Email Service
- `RESEND_API_KEY`: Your Resend API key for email delivery

### Application
- `APP_URL`: Same as NEXTAUTH_URL
- `ADMIN_EMAIL`: Admin email for notifications
- `ENABLE_CRON_JOBS`: Set to "true" for production

## Deployment Steps:

1. **Connect Repository to Vercel**
   - Import your GitHub/GitLab repository
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all variables listed above

3. **Database Setup**
   - Use a hosted PostgreSQL service (Vercel Postgres, Supabase, PlanetScale)
   - Run migrations after deployment:
     ```bash
     npx prisma migrate deploy
     ```

4. **Custom Domain (Optional)**
   - Add your custom domain in Vercel dashboard
   - Update NEXTAUTH_URL and APP_URL accordingly

## Build Command (Default)
```bash
npm run build
```

## Serverless Function Considerations:
- API routes run as serverless functions
- Cron jobs require external service (Vercel Cron, GitHub Actions)
- Database connections are handled by Prisma's connection pooling

## Performance Optimizations:
- Static pages are pre-rendered
- API routes use edge runtime where possible
- Database queries are optimized with proper indexing