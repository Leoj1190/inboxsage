import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateSourceRequest } from '@/types'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sources = await prisma.source.findMany({
      where: { userId: session.user.id },
      include: {
        topic: true,
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ sources })

  } catch (error) {
    console.error('Get sources error:', error)
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

    const body: CreateSourceRequest = await request.json()
    const { name, url, type, description, topicId, metadata } = body

    if (!name || !url || !type) {
      return NextResponse.json(
        { error: 'Name, URL, and type are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Check if source already exists for this user
    const existingSource = await prisma.source.findUnique({
      where: {
        userId_url: {
          userId: session.user.id,
          url
        }
      }
    })

    if (existingSource) {
      return NextResponse.json(
        { error: 'Source with this URL already exists' },
        { status: 409 }
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

    const source = await prisma.source.create({
      data: {
        name,
        url,
        type,
        description,
        topicId,
        metadata,
        userId: session.user.id
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

    return NextResponse.json(
      { 
        message: 'Source created successfully',
        source
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create source error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}