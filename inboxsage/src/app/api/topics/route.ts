import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateTopicRequest } from '@/types'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const topics = await prisma.topic.findMany({
      where: { userId: session.user.id },
      include: {
        sources: {
          where: { isActive: true }
        },
        _count: {
          select: {
            sources: true,
            articles: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ topics })

  } catch (error) {
    console.error('Get topics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CreateTopicRequest = await request.json()
    const { name, description, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Topic name is required' },
        { status: 400 }
      )
    }

    // Check if topic already exists for this user
    const existingTopic = await prisma.topic.findUnique({
      where: {
        userId_name: {
          userId: session.user.id,
          name
        }
      }
    })

    if (existingTopic) {
      return NextResponse.json(
        { error: 'Topic with this name already exists' },
        { status: 409 }
      )
    }

    const topic = await prisma.topic.create({
      data: {
        name,
        description,
        color: color || '#3B82F6',
        userId: session.user.id
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

    return NextResponse.json(
      { 
        message: 'Topic created successfully',
        topic
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create topic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}