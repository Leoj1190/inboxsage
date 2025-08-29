import * as cron from 'node-cron'
import { prisma } from '@/lib/prisma'
import { ContentAggregator } from '@/lib/content-aggregator'
import { AIProcessor } from '@/lib/ai-processor'
import { DigestGenerator } from '@/lib/digest-generator'

export class SchedulerService {
  private contentAggregator: ContentAggregator
  private aiProcessor: AIProcessor
  private digestGenerator: DigestGenerator
  private tasks: Map<string, cron.ScheduledTask>

  constructor() {
    this.contentAggregator = new ContentAggregator()
    this.aiProcessor = new AIProcessor()
    this.digestGenerator = new DigestGenerator()
    this.tasks = new Map()
  }

  /**
   * Initialize all scheduled tasks
   */
  init() {
    if (process.env.ENABLE_CRON_JOBS !== 'true') {
      console.log('Cron jobs disabled')
      return
    }

    console.log('Initializing scheduled tasks...')

    // Content aggregation - every 2 hours
    this.tasks.set('content-fetch', cron.schedule('0 */2 * * *', () => {
      this.runContentAggregation().catch(console.error)
    }, {
      scheduled: true,
      timezone: 'UTC'
    }))

    // AI processing - every 4 hours
    this.tasks.set('ai-processing', cron.schedule('0 */4 * * *', () => {
      this.runAIProcessing().catch(console.error)
    }, {
      scheduled: true,
      timezone: 'UTC'
    }))

    // Daily digest check - every hour
    this.tasks.set('daily-digest', cron.schedule('0 * * * *', () => {
      this.checkDailyDigests().catch(console.error)
    }, {
      scheduled: true,
      timezone: 'UTC'
    }))

    // Weekly digest check - every day at 9 AM
    this.tasks.set('weekly-digest', cron.schedule('0 9 * * *', () => {
      this.checkWeeklyDigests().catch(console.error)
    }, {
      scheduled: true,
      timezone: 'UTC'
    }))

    console.log('Scheduled tasks initialized')
  }

  /**
   * Run content aggregation for all users
   */
  private async runContentAggregation(): Promise<void> {
    console.log('Running scheduled content aggregation...')

    try {
      const users = await prisma.user.findMany({
        select: { id: true }
      })

      const promises = users.map(user => 
        this.contentAggregator.fetchAllUserContent(user.id)
          .catch(error => console.error(`Content aggregation failed for user ${user.id}:`, error))
      )

      await Promise.allSettled(promises)
      console.log(`Content aggregation completed for ${users.length} users`)

    } catch (error) {
      console.error('Content aggregation error:', error)
    }
  }

  /**
   * Run AI processing for all users
   */
  private async runAIProcessing(): Promise<void> {
    console.log('Running scheduled AI processing...')

    try {
      const users = await prisma.user.findMany({
        select: { id: true }
      })

      const promises = users.map(user => 
        this.aiProcessor.processArticles(user.id, 20)
          .catch(error => console.error(`AI processing failed for user ${user.id}:`, error))
      )

      await Promise.allSettled(promises)
      console.log(`AI processing completed for ${users.length} users`)

    } catch (error) {
      console.error('AI processing error:', error)
    }
  }

  /**
   * Check and send daily digests
   */
  private async checkDailyDigests(): Promise<void> {
    console.log('Checking daily digests...')

    try {
      const users = await prisma.user.findMany({
        where: {
          profile: {
            scheduleType: 'DAILY'
          }
        },
        include: {
          profile: true
        }
      })

      for (const user of users) {
        if (!user.profile) continue

        const shouldSend = this.shouldSendDigest(user.profile.timeOfDay, user.profile.timezone)
        
        if (shouldSend) {
          // Check if digest was already sent today
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const existingDigest = await prisma.digest.findFirst({
            where: {
              userId: user.id,
              sentAt: { gte: today },
              emailSent: true
            }
          })

          if (!existingDigest) {
            try {
              await this.digestGenerator.createAndSendDigest(user.id)
              console.log(`Daily digest sent to user ${user.id}`)
            } catch (error) {
              console.error(`Failed to send daily digest to user ${user.id}:`, error)
            }
          }
        }
      }

    } catch (error) {
      console.error('Daily digest check error:', error)
    }
  }

  /**
   * Check and send weekly digests
   */
  private async checkWeeklyDigests(): Promise<void> {
    console.log('Checking weekly digests...')

    try {
      const users = await prisma.user.findMany({
        where: {
          profile: {
            scheduleType: 'WEEKLY'
          }
        },
        include: {
          profile: true
        }
      })

      for (const user of users) {
        if (!user.profile) continue

        const shouldSend = this.shouldSendWeeklyDigest(user.profile.customDays || [1]) // Default to Monday
        
        if (shouldSend) {
          // Check if digest was already sent this week
          const startOfWeek = new Date()
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
          startOfWeek.setHours(0, 0, 0, 0)

          const existingDigest = await prisma.digest.findFirst({
            where: {
              userId: user.id,
              sentAt: { gte: startOfWeek },
              emailSent: true
            }
          })

          if (!existingDigest) {
            try {
              await this.digestGenerator.createAndSendDigest(user.id)
              console.log(`Weekly digest sent to user ${user.id}`)
            } catch (error) {
              console.error(`Failed to send weekly digest to user ${user.id}:`, error)
            }
          }
        }
      }

    } catch (error) {
      console.error('Weekly digest check error:', error)
    }
  }

  /**
   * Check if digest should be sent based on time and timezone
   */
  private shouldSendDigest(timeOfDay: number, timezone: string): boolean {
    try {
      const now = new Date()
      const userTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
      
      return userTime.getHours() === timeOfDay
    } catch (error) {
      console.error('Timezone conversion error:', error)
      return false
    }
  }

  /**
   * Check if weekly digest should be sent
   */
  private shouldSendWeeklyDigest(customDays: number[]): boolean {
    const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
    return customDays.includes(today)
  }

  /**
   * Manual trigger for content aggregation
   */
  async triggerContentAggregation(): Promise<void> {
    await this.runContentAggregation()
  }

  /**
   * Manual trigger for AI processing
   */
  async triggerAIProcessing(): Promise<void> {
    await this.runAIProcessing()
  }

  /**
   * Stop all scheduled tasks
   */
  stopAll(): void {
    this.tasks.forEach((task, name) => {
      task.stop()
      console.log(`Stopped task: ${name}`)
    })
    this.tasks.clear()
  }

  /**
   * Get status of all tasks
   */
  getStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {}
    this.tasks.forEach((task, name) => {
      status[name] = true // Tasks are running if they exist in the map
    })
    return status
  }
}

// Global instance
let schedulerInstance: SchedulerService | null = null

export function getScheduler(): SchedulerService {
  if (!schedulerInstance) {
    schedulerInstance = new SchedulerService()
  }
  return schedulerInstance
}

// Initialize scheduler in production
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON_JOBS === 'true') {
  getScheduler().init()
}