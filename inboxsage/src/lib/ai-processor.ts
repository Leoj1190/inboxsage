import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { SummaryDepth, SummaryFormat, SummaryStyle } from '@prisma/client'
import { ArticleProcessingResult } from '@/types'

export class AIProcessor {
  private openai: OpenAI

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required')
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  /**
   * Process articles with AI summarization
   */
  async processArticles(userId: string, maxArticles: number = 10): Promise<void> {
    // Get user preferences
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId }
    })

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    // Get unprocessed articles
    const articles = await prisma.article.findMany({
      where: {
        source: { userId },
        isProcessed: false,
        isIncluded: true
      },
      orderBy: { publishedAt: 'desc' },
      take: maxArticles
    })

    for (const article of articles) {
      try {
        const result = await this.processArticle(article, userProfile)
        
        await prisma.article.update({
          where: { id: article.id },
          data: {
            summary: result.summary,
            keyTakeaways: result.keyTakeaways,
            relevanceScore: result.relevanceScore,
            sentiment: result.sentiment,
            tags: result.tags,
            isProcessed: true
          }
        })
      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error)
        // Mark as processed to avoid infinite retry
        await prisma.article.update({
          where: { id: article.id },
          data: { isProcessed: true }
        })
      }
    }
  }

  /**
   * Process a single article
   */
  async processArticle(article: any, userProfile: any): Promise<ArticleProcessingResult> {
    const content = article.content || article.excerpt || article.title
    
    if (!content || content.length < 50) {
      throw new Error('Article content too short for processing')
    }

    const summary = await this.generateSummary(content, userProfile)
    const keyTakeaways = await this.extractKeyTakeaways(content, userProfile)
    const relevanceScore = this.calculateRelevanceScore(article, userProfile)
    const sentiment = await this.analyzeSentiment(content)
    const tags = this.enhanceTags(article.tags || [], content)

    return {
      summary,
      keyTakeaways,
      relevanceScore,
      sentiment,
      readingTime: article.readingTime || this.estimateReadingTime(content),
      tags
    }
  }

  /**
   * Generate AI summary based on user preferences
   */
  private async generateSummary(content: string, userProfile: any): Promise<string> {
    const { summaryDepth, summaryFormat, summaryStyle, languagePreference } = userProfile

    let prompt = this.buildSummaryPrompt(content, summaryDepth, summaryFormat, summaryStyle, languagePreference)

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that creates concise and informative summaries of articles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.getMaxTokens(summaryDepth),
        temperature: this.getTemperature(summaryStyle)
      })

      return response.choices[0]?.message?.content || 'Unable to generate summary'
    } catch (error) {
      console.error('Error generating summary:', error)
      return 'Summary generation failed'
    }
  }

  /**
   * Extract key takeaways from content
   */
  private async extractKeyTakeaways(content: string, userProfile: any): Promise<string[]> {
    const prompt = `Extract 3-5 key takeaways from this article. Return as a JSON array of strings. Focus on actionable insights and important facts.

Article content:
${content.substring(0, 2000)}...`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You extract key takeaways from articles and return them as JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      })

      const result = response.choices[0]?.message?.content
      if (result) {
        try {
          return JSON.parse(result)
        } catch {
          // Fallback: split by lines or semicolons
          return result.split(/\n|;/).filter(item => item.trim().length > 0).slice(0, 5)
        }
      }
      return []
    } catch (error) {
      console.error('Error extracting takeaways:', error)
      return []
    }
  }

  /**
   * Analyze sentiment of the content
   */
  private async analyzeSentiment(content: string): Promise<'positive' | 'negative' | 'neutral'> {
    const prompt = `Analyze the sentiment of this article content. Respond with only one word: "positive", "negative", or "neutral".

Content: ${content.substring(0, 1000)}...`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You analyze sentiment and respond with only: positive, negative, or neutral'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      })

      const sentiment = response.choices[0]?.message?.content?.toLowerCase().trim()
      return ['positive', 'negative', 'neutral'].includes(sentiment as string) 
        ? (sentiment as 'positive' | 'negative' | 'neutral')
        : 'neutral'
    } catch (error) {
      console.error('Error analyzing sentiment:', error)
      return 'neutral'
    }
  }

  /**
   * Calculate relevance score based on user preferences and topics
   */
  private calculateRelevanceScore(article: any, userProfile: any): number {
    let score = 0.5 // Base score

    // Factor in reading time preference
    const idealReadingTime = 5 // minutes
    const timeDiff = Math.abs((article.readingTime || 5) - idealReadingTime)
    score += Math.max(0, (5 - timeDiff) / 10)

    // Factor in recency
    const daysSincePublished = Math.floor(
      (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    score += Math.max(0, (7 - daysSincePublished) / 14)

    // Factor in tags (simple keyword matching)
    if (article.tags && article.tags.length > 0) {
      score += article.tags.length * 0.05
    }

    return Math.min(1, Math.max(0, score))
  }

  /**
   * Enhance tags using AI
   */
  private enhanceTags(existingTags: string[], content: string): string[] {
    // For now, return existing tags. Could enhance with AI topic extraction
    return existingTags.slice(0, 10)
  }

  /**
   * Build summary prompt based on preferences
   */
  private buildSummaryPrompt(
    content: string, 
    depth: SummaryDepth, 
    format: SummaryFormat, 
    style: SummaryStyle, 
    language: string
  ): string {
    let prompt = `Summarize this article content`

    // Add depth instruction
    switch (depth) {
      case 'BASIC':
        prompt += ' in 2-3 sentences'
        break
      case 'DEEP':
        prompt += ' in detail with context and implications'
        break
      case 'EXTRACTIVE':
        prompt += ' by extracting the most important quotes and facts'
        break
    }

    // Add format instruction
    switch (format) {
      case 'BULLETS':
        prompt += ' using bullet points'
        break
      case 'PARAGRAPHS':
        prompt += ' in paragraph form'
        break
      case 'MIXED':
        prompt += ' using a mix of paragraphs and bullet points where appropriate'
        break
    }

    // Add style instruction
    switch (style) {
      case 'PROFESSIONAL':
        prompt += ' in a professional tone'
        break
      case 'CASUAL':
        prompt += ' in a casual, friendly tone'
        break
      case 'WITTY':
        prompt += ' with a witty, engaging tone'
        break
    }

    if (language !== 'en') {
      prompt += ` in ${language}`
    }

    prompt += `:\n\n${content.substring(0, 3000)}...`

    return prompt
  }

  /**
   * Get max tokens based on summary depth
   */
  private getMaxTokens(depth: SummaryDepth): number {
    switch (depth) {
      case 'BASIC': return 150
      case 'DEEP': return 400
      case 'EXTRACTIVE': return 300
      default: return 200
    }
  }

  /**
   * Get temperature based on style
   */
  private getTemperature(style: SummaryStyle): number {
    switch (style) {
      case 'PROFESSIONAL': return 0.3
      case 'CASUAL': return 0.7
      case 'WITTY': return 0.9
      default: return 0.5
    }
  }

  /**
   * Estimate reading time
   */
  private estimateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  }
}