import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { DigestGenerator } from '@/lib/digest-generator'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const generator = new DigestGenerator()
    const preview = await generator.getDigestPreview(session.user.id)

    return NextResponse.json({ preview })

  } catch (error) {
    console.error('Digest preview error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const generator = new DigestGenerator()
    await generator.createAndSendDigest(session.user.id)

    return NextResponse.json({
      message: 'Digest sent successfully'
    })

  } catch (error) {
    console.error('Send digest error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}