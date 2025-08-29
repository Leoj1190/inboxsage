// Re-export Prisma generated types
export * from '@prisma/client'

// Additional types for our application
export interface CreateUserRequest {
  email: string
  name: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UpdateProfileRequest {
  digestEmails?: string[]
  scheduleType?: 'DAILY' | 'WEEKLY' | 'CUSTOM'
  customDays?: number[]
  timeOfDay?: number
  timezone?: string
  summaryDepth?: 'BASIC' | 'DEEP' | 'EXTRACTIVE'
  summaryFormat?: 'BULLETS' | 'PARAGRAPHS' | 'MIXED'
  summaryStyle?: 'PROFESSIONAL' | 'CASUAL' | 'WITTY'
  languagePreference?: string
  maxItemsPerDigest?: number
  includeImages?: boolean
  includeVideos?: boolean
}

export interface CreateSourceRequest {
  name: string
  url: string
  type: 'RSS' | 'EMAIL' | 'TWITTER' | 'MEDIUM' | 'CUSTOM_URL' | 'NEWSLETTER'
  description?: string
  topicId?: string
  metadata?: Record<string, any>
}

export interface CreateTopicRequest {
  name: string
  description?: string
  color?: string
}

export interface ArticleProcessingResult {
  summary: string
  keyTakeaways: string[]
  relevanceScore: number
  sentiment: 'positive' | 'negative' | 'neutral'
  readingTime: number
  tags: string[]
}

export interface DigestPreview {
  title: string
  introduction: string
  highlights: string[]
  items: DigestItemPreview[]
  conclusion: string
}

export interface DigestItemPreview {
  article: {
    id: string
    title: string
    url: string
    author?: string
    publishedAt: Date
    summary?: string
    keyTakeaways: string[]
    relevanceScore?: number
    imageUrl?: string
  }
  isHighlight: boolean
  order: number
}

export interface FeedbackRequest {
  articleId: string
  type: 'USEFUL' | 'NOT_USEFUL' | 'IRRELEVANT' | 'EXCELLENT'
  rating?: number
  comment?: string
}

export interface SourceSuggestion {
  name: string
  url: string
  type: 'RSS' | 'EMAIL' | 'TWITTER' | 'MEDIUM' | 'CUSTOM_URL' | 'NEWSLETTER'
  description: string
  category: string
  popularity: number
}

export interface EmailDigestData {
  user: {
    name: string
    email: string
  }
  digest: {
    title: string
    introduction: string
    highlights: string[]
    conclusion: string
    generatedAt: Date
  }
  items: DigestItemPreview[]
  unsubscribeUrl: string
  preferencesUrl: string
}