import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/email-service'
import { AIProcessor } from '@/lib/ai-processor'
import { DigestPreview, EmailDigestData } from '@/types'

export class DigestGenerator {
  private emailService: EmailService
  private aiProcessor: AIProcessor

  constructor() {
    this.emailService = new EmailService()
    this.aiProcessor = new AIProcessor()
  }

  /**
   * Generate digest for a specific user
   */
  async generateUserDigest(userId: string): Promise<DigestPreview> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        topics: true
      }
    })

    if (!user || !user.profile) {
      throw new Error('User or profile not found')
    }

    // Get processed articles from the last week (or since last digest)
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    const articles = await prisma.article.findMany({
      where: {
        source: { userId },
        isProcessed: true,
        isIncluded: true,
        publishedAt: { gte: lastWeek },
        summary: { not: null }
      },
      include: {
        source: true,
        topic: true
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: user.profile.maxItemsPerDigest
    })

    if (articles.length === 0) {
      throw new Error('No articles available for digest')
    }

    // Generate digest content
    const digest = await this.buildDigest(user, articles)
    
    return digest
  }

  /**
   * Create and send digest
   */
  async createAndSendDigest(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    })

    if (!user || !user.profile) {
      throw new Error('User or profile not found')
    }

    // Generate digest preview
    const digestPreview = await this.generateUserDigest(userId)

    // Save digest to database
    const savedDigest = await prisma.digest.create({
      data: {
        title: digestPreview.title,
        userId,
        introduction: digestPreview.introduction,
        conclusion: digestPreview.conclusion,
        highlights: digestPreview.highlights,
        scheduledFor: new Date(),
        items: {
          create: digestPreview.items.map((item, index) => ({
            articleId: item.article.id,
            order: index,
            isHighlight: item.isHighlight,
            customSummary: item.article.summary
          }))
        }
      },
      include: {
        items: {
          include: {
            article: {
              include: {
                source: true,
                topic: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    // Send emails to all configured addresses
    const emailPromises = user.profile.digestEmails.map(async (email) => {
      const emailData: EmailDigestData = {
        user: {
          name: user.name,
          email: email
        },
        digest: {
          title: savedDigest.title,
          introduction: savedDigest.introduction || '',
          highlights: savedDigest.highlights,
          conclusion: savedDigest.conclusion || '',
          generatedAt: savedDigest.generatedAt
        },
        items: savedDigest.items.map(item => ({
          article: {
            id: item.article.id,
            title: item.article.title,
            url: item.article.url,
            author: item.article.author,
            publishedAt: item.article.publishedAt,
            summary: item.article.summary,
            keyTakeaways: item.article.keyTakeaways,
            relevanceScore: item.article.relevanceScore,
            imageUrl: item.article.imageUrl
          },
          isHighlight: item.isHighlight,
          order: item.order
        })),
        unsubscribeUrl: `${process.env.APP_URL}/unsubscribe?token=${userId}`,
        preferencesUrl: `${process.env.APP_URL}/dashboard/settings`
      }

      const result = await this.emailService.sendDigest(emailData)
      
      if (result.success) {
        console.log(`Digest sent successfully to ${email}`)
        return result.emailId
      } else {
        console.error(`Failed to send digest to ${email}:`, result.error)
        throw new Error(result.error)
      }
    })

    try {
      const emailIds = await Promise.all(emailPromises)
      
      // Update digest as sent
      await prisma.digest.update({
        where: { id: savedDigest.id },
        data: {
          emailSent: true,
          sentAt: new Date(),
          emailId: emailIds[0] // Store first email ID
        }
      })
    } catch (error) {
      // Update digest with error
      await prisma.digest.update({
        where: { id: savedDigest.id },
        data: {
          emailError: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      throw error
    }
  }

  /**
   * Build digest content
   */
  private async buildDigest(user: any, articles: any[]): Promise<DigestPreview> {
    const today = new Date()
    const title = this.generateDigestTitle(user.profile.scheduleType, today)

    // Select top 3 articles as highlights
    const highlights = articles
      .slice(0, 3)
      .map(article => `${article.title} - ${article.summary?.substring(0, 100)}...`)

    // Generate introduction
    const introduction = this.generateIntroduction(user.name, articles.length, user.profile.scheduleType)

    // Generate conclusion
    const conclusion = this.generateConclusion(articles.length)

    // Prepare digest items
    const items = articles.map((article, index) => ({
      article: {
        id: article.id,
        title: article.title,
        url: article.url,
        author: article.author,
        publishedAt: article.publishedAt,
        summary: article.summary,
        keyTakeaways: article.keyTakeaways,
        relevanceScore: article.relevanceScore,
        imageUrl: article.imageUrl
      },
      isHighlight: index < 3, // First 3 are highlights
      order: index
    }))

    return {
      title,
      introduction,
      highlights,
      items,
      conclusion
    }
  }

  /**
   * Generate digest title
   */
  private generateDigestTitle(scheduleType: string, date: Date): string {
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    switch (scheduleType) {
      case 'DAILY':
        return `Daily Digest - ${dateStr}`
      case 'WEEKLY':
        return `Weekly Digest - Week of ${dateStr}`
      default:
        return `InboxSage Digest - ${dateStr}`
    }
  }

  /**
   * Generate introduction text
   */
  private generateIntroduction(name: string, articleCount: number, scheduleType: string): string {
    const greetings = [
      `Here's your curated digest with ${articleCount} articles from your favorite sources.`,
      `We've summarized ${articleCount} articles to help you stay informed.`,
      `Your personalized digest contains ${articleCount} key articles from this period.`
    ]

    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  /**
   * Generate conclusion text
   */
  private generateConclusion(articleCount: number): string {
    const conclusions = [
      "Thanks for reading! We hope you found these insights valuable.",
      "Stay curious and keep learning. See you in the next digest!",
      "That's a wrap for this digest. Happy reading!"
    ]

    return conclusions[Math.floor(Math.random() * conclusions.length)]
  }

  /**
   * Get digest preview without sending
   */
  async getDigestPreview(userId: string): Promise<DigestPreview> {
    return this.generateUserDigest(userId)
  }

  /**
   * Send test digest
   */
  async sendTestDigest(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const result = await this.emailService.sendTestEmail(user.email, user.name)
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send test email')
    }
  }
}