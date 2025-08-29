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

    const { name, description, topicId, isActive, metadata } = await request.json()

    // Verify source belongs to user
    const existingSource = await prisma.source.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingSource) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      )
    }

    // If topicId is provided, verify it belongs to the user
    if (topicId) {
      const topic = await prisma.topic.findFirst({
        where: {
          id: topicId,
          userId: session.user.id
        }
      })

      if (!topic) {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        )
      }
    }

    const source = await prisma.source.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(topicId !== undefined && { topicId }),
        ...(isActive !== undefined && { isActive }),
        ...(metadata && { metadata }),
        updatedAt: new Date()
      },
      include: {
        topic: true,
        _count: {
          select: {
            articles: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Source updated successfully',
      source
    })

  } catch (error) {
    console.error('Update source error:', error)
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

    // Verify source belongs to user
    const existingSource = await prisma.source.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingSource) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      )
    }

    await prisma.source.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Source deleted successfully'
    })

  } catch (error) {
    console.error('Delete source error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}