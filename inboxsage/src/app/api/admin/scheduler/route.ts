import { NextRequest, NextResponse } from 'next/server'
import { getScheduler } from '@/lib/scheduler'

export async function GET() {
  try {
    const scheduler = getScheduler()
    const status = scheduler.getStatus()

    return NextResponse.json({
      status,
      enabled: process.env.ENABLE_CRON_JOBS === 'true'
    })

  } catch (error) {
    console.error('Scheduler status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    const scheduler = getScheduler()

    switch (action) {
      case 'trigger-content':
        await scheduler.triggerContentAggregation()
        return NextResponse.json({ message: 'Content aggregation triggered' })
      
      case 'trigger-ai':
        await scheduler.triggerAIProcessing()
        return NextResponse.json({ message: 'AI processing triggered' })
      
      case 'stop-all':
        scheduler.stopAll()
        return NextResponse.json({ message: 'All tasks stopped' })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Scheduler action error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}