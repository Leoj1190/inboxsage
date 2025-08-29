'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  Rss, 
  Mail, 
  Brain, 
  TrendingUp, 
  Calendar,
  Plus,
  BarChart3,
  FileText,
  Clock,
  Users
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalSources: number
  totalArticles: number
  totalDigests: number
  lastDigestSent?: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalSources: 0,
    totalArticles: 0,
    totalDigests: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load user profile and stats
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        const user = data.user
        
        setStats({
          totalSources: user.sources?.length || 0,
          totalArticles: user.sources?.reduce((total: number, source: any) => 
            total + (source._count?.articles || 0), 0) || 0,
          totalDigests: 0, // Will be loaded separately
          lastDigestSent: undefined
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      name: 'Add Source',
      description: 'Add a new RSS feed or newsletter',
      href: '/dashboard/sources?action=add',
      icon: Plus,
      color: 'bg-blue-500'
    },
    {
      name: 'Preview Digest',
      description: 'See what your next digest will look like',
      href: '/dashboard/preview',
      icon: Mail,
      color: 'bg-green-500'
    },
    {
      name: 'AI Settings',
      description: 'Customize your AI summary preferences',
      href: '/dashboard/settings#ai',
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      name: 'Schedule Settings',
      description: 'Change your digest schedule',
      href: '/dashboard/settings#schedule',
      icon: Calendar,
      color: 'bg-orange-500'
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your content aggregation
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Rss className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sources</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalSources}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Articles</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalArticles}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Digests Sent</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalDigests}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Digest</p>
              <p className="text-sm font-semibold text-gray-900">
                {stats.lastDigestSent || 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="card hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start">
                <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      {stats.totalSources === 0 && (
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500">
                <Brain className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-primary-900">
                Welcome to InboxSage!
              </h3>
              <div className="mt-2 text-sm text-primary-700">
                <p className="mb-3">
                  Let's get you started by setting up your first content sources. 
                  Here's what you can do:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Add RSS feeds from your favorite blogs and news sites</li>
                  <li>Organize sources into topics (like "Tech", "Business", etc.)</li>
                  <li>Customize your AI summary preferences</li>
                  <li>Set up your digest schedule</li>
                </ul>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/sources"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Source
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Sources</h3>
            <Link href="/dashboard/sources" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          {stats.totalSources === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No sources added yet. <Link href="/dashboard/sources" className="text-primary-600">Add your first source</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {/* This would be populated with actual recent sources */}
              <div className="text-gray-500 text-center py-8">
                Loading recent sources...
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Digest History</h3>
            <Link href="/dashboard/history" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          {stats.totalDigests === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No digests sent yet. <Link href="/dashboard/preview" className="text-primary-600">Preview your first digest</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {/* This would be populated with actual digest history */}
              <div className="text-gray-500 text-center py-8">
                Loading digest history...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}