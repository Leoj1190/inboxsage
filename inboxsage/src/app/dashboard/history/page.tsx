'use client'

import { useState, useEffect } from 'react'
import { Mail, Calendar, ExternalLink, Download } from 'lucide-react'

export default function HistoryPage() {
  const [digests, setDigests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      // This would be implemented as /api/digests endpoint
      // For now, showing empty state
      setDigests([])
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Digest History</h1>
          <p className="text-gray-600 mt-1">
            View and download your past digests
          </p>
        </div>
      </div>

      {digests.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No digests sent yet</h3>
          <p className="text-gray-500 mb-6">
            Your sent digests will appear here. Send your first digest to get started.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard/preview'}
            className="btn-primary"
          >
            Create First Digest
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sample digest entries would be rendered here */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg mr-4">
                  <Mail className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Weekly Digest - Week of January 15, 2024
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Sent on January 15, 2024 at 9:00 AM</span>
                    <span className="mx-2">•</span>
                    <span>15 articles</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}