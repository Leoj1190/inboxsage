import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { AIProcessor } from '@/lib/ai-processor'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { maxArticles = 10 } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const processor = new AIProcessor()
    await processor.processArticles(session.user.id, maxArticles)

    return NextResponse.json({
      message: 'Articles processed successfully'
    })

  } catch (error) {
    console.error('AI processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}