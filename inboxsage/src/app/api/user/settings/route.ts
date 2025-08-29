import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateProfileRequest } from '@/types'

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: UpdateProfileRequest = await request.json()

    const updatedProfile = await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}