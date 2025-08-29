import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { DigestGenerator } from '@/lib/digest-generator'

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
    await generator.sendTestDigest(session.user.id)

    return NextResponse.json({
      message: 'Test email sent successfully'
    })

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}