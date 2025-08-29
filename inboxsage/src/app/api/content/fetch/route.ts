import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { ContentAggregator } from '@/lib/content-aggregator'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { sourceId } = await request.json()

    const aggregator = new ContentAggregator()

    if (sourceId) {
      // Fetch content from specific source
      await aggregator.triggerManualFetch(sourceId, session.user.id)
    } else {
      // Fetch content from all user sources
      await aggregator.fetchAllUserContent(session.user.id)
    }

    return NextResponse.json({
      message: sourceId ? 'Source content fetched successfully' : 'All sources content fetched successfully'
    })

  } catch (error) {
    console.error('Content fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}