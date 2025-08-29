import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { CreateUserRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json()
    const { email, name, password } = body

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with default profile
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        profile: {
          create: {
            digestEmails: [email],
            scheduleType: 'WEEKLY',
            timeOfDay: 9,
            timezone: 'UTC',
            summaryDepth: 'BASIC',
            summaryFormat: 'MIXED',
            summaryStyle: 'PROFESSIONAL',
            languagePreference: 'en',
            maxItemsPerDigest: 20,
            includeImages: true,
            includeVideos: false,
          }
        }
      },
      include: {
        profile: true
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}