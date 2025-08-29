# InboxSage 🧠

**AI-Powered Newsletter Aggregation Platform**

InboxSage is a comprehensive full-stack application that aggregates newsletters and content from your favorite sources, uses AI to create intelligent summaries, and delivers clean, personalized digests to your inbox on a customizable schedule.

## ✨ Features

### 🔐 User Management
- Secure authentication with NextAuth.js
- User profiles with customizable preferences
- Multi-email digest delivery support

### 📰 Content Aggregation
- **RSS Feed Support** - Add any RSS feed URL
- **Newsletter Integration** - Email-based newsletter processing
- **Social Media** - Twitter handles and Medium authors
- **Custom URLs** - Web scraping for custom content sources
- **Topic Organization** - Organize sources by topics (Tech, Business, etc.)

### 🤖 AI-Powered Intelligence
- **Smart Summarization** - OpenAI-powered content summaries
- **Key Takeaways** - Extract actionable insights
- **Relevance Scoring** - AI ranks content by importance
- **Sentiment Analysis** - Understand content tone
- **Customizable AI Preferences**:
  - Summary depth (Basic, Deep, Extractive)
  - Format (Bullets, Paragraphs, Mixed)
  - Style (Professional, Casual, Witty)
  - Language preferences

### 📅 Flexible Scheduling
- **Daily Digests** - Receive updates every day
- **Weekly Digests** - Get weekly roundups
- **Custom Schedules** - Choose specific days
- **Time Zone Support** - Deliver at your preferred time
- **Multiple Recipients** - Send to multiple email addresses

### 📧 Beautiful Email Delivery
- **HTML Email Templates** - Clean, responsive design
- **Mobile Optimized** - Perfect on any device
- **Rich Content** - Images, links, and formatted text
- **Unsubscribe Management** - Easy opt-out options

### 🎛️ Advanced Management
- **Source Management** - Add, edit, and organize content sources
- **Digest Preview** - See what your next digest will look like
- **History Tracking** - View all past digests
- **Feedback System** - Rate articles to improve AI recommendations
- **Admin Controls** - Manual content fetching and processing

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **NextAuth.js** - Authentication

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Robust relational database
- **OpenAI API** - AI summarization and processing

### Services & Integration
- **RSS Parser** - Content aggregation from RSS feeds
- **Resend** - Reliable email delivery
- **Node Cron** - Scheduled task management
- **bcryptjs** - Secure password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Resend API key (for email delivery)

### Setup Steps

1. **Clone and Install**
   ```bash
   cd inboxsage
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env.local` and configure:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/inboxsage"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"
   
   # Resend Email
   RESEND_API_KEY="your-resend-api-key"
   
   # App Configuration
   APP_URL="http://localhost:3000"
   ENABLE_CRON_JOBS="false"
   ```

3. **Database Setup**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Create an account or sign in
   - Start adding your content sources!

## 🎯 Quick Start Guide

### 1. **User Onboarding**
- Create an account with email and password
- Set up your profile preferences
- Configure digest schedule and AI settings

### 2. **Add Content Sources**
- Navigate to Sources tab
- Add RSS feeds from your favorite sites
- Organize sources into topics
- Enable/disable sources as needed

### 3. **Customize AI Settings**
- Choose summary depth and format
- Select writing style preference
- Set language and content preferences
- Configure relevance filters

### 4. **Preview & Send**
- Use "Preview Digest" to see upcoming content
- Send test emails to verify configuration
- Manual digest generation for immediate delivery

### 5. **Automated Delivery**
- Enable cron jobs for automatic processing
- Content fetching every 2 hours
- AI processing every 4 hours  
- Digest delivery based on your schedule

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/settings` - Update user preferences

### Content Management
- `GET /api/topics` - List user topics
- `POST /api/topics` - Create new topic
- `GET /api/sources` - List user sources
- `POST /api/sources` - Add new source
- `POST /api/content/fetch` - Trigger content aggregation
- `POST /api/content/process` - Trigger AI processing

### Digest Management
- `GET /api/digest` - Preview digest
- `POST /api/digest` - Generate and send digest
- `POST /api/digest/test` - Send test email

### Admin
- `GET /api/admin/scheduler` - Scheduler status
- `POST /api/admin/scheduler` - Scheduler controls

## 🔄 Automated Workflows

### Content Aggregation Pipeline
1. **Fetch** - RSS feeds parsed every 2 hours
2. **Process** - AI summarization every 4 hours  
3. **Deliver** - Digests sent based on user schedule
4. **Learn** - User feedback improves recommendations

### Scheduling System
- **Daily Digests** - Check every hour for delivery time
- **Weekly Digests** - Check daily for scheduled day
- **Custom Schedules** - Flexible day selection
- **Timezone Aware** - Respects user timezone preferences

## 🚀 Deployment Options

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables
3. Deploy with automatic builds

### Docker
```dockerfile
# Dockerfile included for containerized deployment
docker build -t inboxsage .
docker run -p 3000:3000 inboxsage
```

### Self-Hosted
- Any Node.js hosting platform
- Requires PostgreSQL database
- Environment variables configuration

## 📊 Performance & Scaling

### Database Optimization
- Indexed queries for fast source lookups
- Efficient article deduplication
- Optimized user preference loading

### Caching Strategy  
- API response caching
- Digest preview caching
- Source metadata caching

### Rate Limiting
- OpenAI API call optimization
- Email delivery rate management
- RSS feed fetch throttling

## 🔒 Security Features

### Authentication & Authorization
- Secure password hashing with bcrypt
- JWT session management  
- User data isolation
- API route protection

### Data Privacy
- No content storage beyond processing
- Secure API key management
- Optional user data deletion
- GDPR compliance ready

## 🤝 Contributing

InboxSage is built with modern web development best practices:

### Code Structure
- **Type Safety** - Full TypeScript implementation
- **Component Library** - Reusable UI components
- **API Design** - RESTful endpoints with error handling
- **Database Design** - Normalized schema with relationships

### Development Workflow
- ESLint for code quality
- Prettier for code formatting  
- Type checking with TypeScript
- Database migrations with Prisma

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, feature requests, or bug reports:
- Create an issue in the repository
- Check the documentation
- Review the example configurations

---

**Built with ❤️ using Next.js, OpenAI, and modern web technologies**

Transform your information overload into actionable insights with InboxSage! 🚀