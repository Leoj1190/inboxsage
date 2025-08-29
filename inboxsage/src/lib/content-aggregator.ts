import Parser from 'rss-parser'
import { prisma } from '@/lib/prisma'
import { SourceType } from '@prisma/client'

interface RSSFeedItem {
  title?: string
  link?: string
  pubDate?: string
  content?: string
  contentSnippet?: string
  creator?: string
  author?: string
  'content:encoded'?: string
}

interface RSSFeed {
  title?: string
  description?: string
  items: RSSFeedItem[]
}

export class ContentAggregator {
  private parser: Parser<any, RSSFeedItem>

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['content:encoded', 'creator']
      }
    })
  }

  /**
   * Fetch content from all active sources for a user
   */
  async fetchAllUserContent(userId: string): Promise<void> {
    const sources = await prisma.source.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        topic: true
      }
    })

    const fetchPromises = sources.map(source => 
      this.fetchSourceContent(source.id).catch(error => {
        console.error(`Error fetching content for source ${source.id}:`, error)
        // Update fetch error count
        return prisma.source.update({
          where: { id: source.id },
          data: {
            fetchErrors: { increment: 1 },
            lastFetched: new Date()
          }
        })
      })
    )

    await Promise.allSettled(fetchPromises)
  }

  /**
   * Fetch content from a specific source
   */
  async fetchSourceContent(sourceId: string): Promise<void> {
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: { topic: true }
    })

    if (!source || !source.isActive) {
      throw new Error('Source not found or inactive')
    }

    let articles: any[] = []

    switch (source.type) {
      case SourceType.RSS:
        articles = await this.fetchRSSContent(source.url)
        break
      case SourceType.NEWSLETTER:
        // For newsletters, content would be processed via email integration
        console.log('Newsletter processing not implemented yet')
        break
      case SourceType.TWITTER:
        // Twitter API integration would go here
        console.log('Twitter processing not implemented yet')
        break
      case SourceType.MEDIUM:
        // Medium RSS feeds can be processed as RSS
        articles = await this.fetchRSSContent(source.url)
        break
      case SourceType.CUSTOM_URL:
        // Custom URL scraping would go here
        console.log('Custom URL processing not implemented yet')
        break
      default:
        throw new Error(`Unsupported source type: ${source.type}`)
    }

    // Save articles to database
    if (articles.length > 0) {
      await this.saveArticles(articles, source)
    }

    // Update source last fetched time and reset error count
    await prisma.source.update({
      where: { id: sourceId },
      data: {
        lastFetched: new Date(),
        fetchErrors: 0
      }
    })
  }

  /**
   * Fetch RSS content
   */
  private async fetchRSSContent(url: string): Promise<any[]> {
    try {
      const feed: RSSFeed = await this.parser.parseURL(url)
      
      return feed.items.map(item => ({
        title: item.title || 'Untitled',
        url: item.link || '',
        content: item['content:encoded'] || item.content || item.contentSnippet || '',
        excerpt: this.extractExcerpt(item.contentSnippet || item.content || ''),
        author: item.creator || item.author || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        readingTime: this.estimateReadingTime(item.content || item.contentSnippet || ''),
        imageUrl: this.extractImageUrl(item.content || item['content:encoded'] || '')
      }))
    } catch (error) {
      console.error('Error parsing RSS feed:', error)
      throw new Error('Failed to parse RSS feed')
    }
  }

  /**
   * Save articles to database
   */
  private async saveArticles(articles: any[], source: any): Promise<void> {
    for (const articleData of articles) {
      try {
        // Check if article already exists
        const existingArticle = await prisma.article.findUnique({
          where: {
            sourceId_url: {
              sourceId: source.id,
              url: articleData.url
            }
          }
        })

        if (!existingArticle) {
          await prisma.article.create({
            data: {
              title: articleData.title,
              content: articleData.content,
              excerpt: articleData.excerpt,
              url: articleData.url,
              author: articleData.author,
              publishedAt: articleData.publishedAt,
              readingTime: articleData.readingTime,
              imageUrl: articleData.imageUrl,
              sourceId: source.id,
              topicId: source.topicId,
              tags: this.extractTags(articleData.content || articleData.title)
            }
          })
        }
      } catch (error) {
        console.error('Error saving article:', error)
        // Continue with other articles
      }
    }
  }

  /**
   * Extract excerpt from content
   */
  private extractExcerpt(content: string, maxLength: number = 200): string {
    if (!content) return ''
    
    // Remove HTML tags
    const cleanContent = content.replace(/<[^>]*>/g, '').trim()
    
    if (cleanContent.length <= maxLength) {
      return cleanContent
    }
    
    return cleanContent.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
  }

  /**
   * Estimate reading time in minutes
   */
  private estimateReadingTime(content: string): number {
    if (!content) return 0
    
    const wordsPerMinute = 200
    const cleanContent = content.replace(/<[^>]*>/g, '')
    const wordCount = cleanContent.split(/\s+/).length
    
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  }

  /**
   * Extract image URL from content
   */
  private extractImageUrl(content: string): string | null {
    if (!content) return null
    
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i)
    return imgMatch ? imgMatch[1] : null
  }

  /**
   * Extract tags from content
   */
  private extractTags(content: string): string[] {
    if (!content) return []
    
    // Simple tag extraction - in a real app, you might use NLP
    const commonTags = ['ai', 'technology', 'crypto', 'blockchain', 'web3', 'startup', 'business', 'marketing', 'design', 'development']
    const extractedTags: string[] = []
    
    const lowerContent = content.toLowerCase()
    for (const tag of commonTags) {
      if (lowerContent.includes(tag)) {
        extractedTags.push(tag)
      }
    }
    
    return extractedTags.slice(0, 5) // Limit to 5 tags
  }

  /**
   * Manual content fetch endpoint
   */
  async triggerManualFetch(sourceId: string, userId: string): Promise<void> {
    // Verify source belongs to user
    const source = await prisma.source.findFirst({
      where: {
        id: sourceId,
        userId
      }
    })

    if (!source) {
      throw new Error('Source not found or access denied')
    }

    await this.fetchSourceContent(sourceId)
  }
}