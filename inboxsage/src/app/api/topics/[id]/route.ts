import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, description, color } = await request.json()

    // Verify topic belongs to user
    const existingTopic = await prisma.topic.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingTopic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    const topic = await prisma.topic.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            sources: true,
            articles: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Topic updated successfully',
      topic
    })

  } catch (error) {
    console.error('Update topic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify topic belongs to user
    const existingTopic = await prisma.topic.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingTopic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    await prisma.topic.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Topic deleted successfully'
    })

  } catch (error) {
    console.error('Delete topic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}