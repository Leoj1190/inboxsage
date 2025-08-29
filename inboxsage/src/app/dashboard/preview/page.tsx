'use client'

import { useState, useEffect } from 'react'
import { Send, RefreshCw, Mail, Clock, Star, ExternalLink } from 'lucide-react'

export default function PreviewPage() {
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadPreview()
  }, [])

  const loadPreview = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/digest')
      if (response.ok) {
        const data = await response.json()
        setPreview(data.preview)
      } else {
        // Handle no content case
        setPreview(null)
      }
    } catch (error) {
      console.error('Error loading preview:', error)
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  const sendDigest = async () => {
    setSending(true)
    try {
      const response = await fetch('/api/digest', {
        method: 'POST'
      })
      
      if (response.ok) {
        alert('Digest sent successfully!')
      } else {
        alert('Failed to send digest')
      }
    } catch (error) {
      console.error('Error sending digest:', error)
      alert('Failed to send digest')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!preview) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Digest Preview</h1>
            <p className="text-gray-600 mt-1">Preview your next digest before sending</p>
          </div>
        </div>

        <div className="text-center py-12">
          <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content available</h3>
          <p className="text-gray-500 mb-6">
            Add some sources and fetch content to generate your first digest preview.
          </p>
          <div className="space-x-3">
            <button
              onClick={() => window.location.href = '/dashboard/sources'}
              className="btn-primary"
            >
              Add Sources
            </button>
            <button
              onClick={loadPreview}
              className="btn-secondary"
            >
              Retry Preview
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Digest Preview</h1>
          <p className="text-gray-600 mt-1">
            Preview of your next digest • {preview.items?.length || 0} articles
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadPreview}
            disabled={loading}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={sendDigest}
            disabled={sending}
            className="btn-primary flex items-center"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Now'}
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-4xl mx-auto">
        {/* Email Preview Container */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Email Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {preview.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Preview Mode</p>
                <p className="text-xs text-gray-500">Actual email will be styled</p>
              </div>
            </div>
          </div>

          {/* Email Content */}
          <div className="px-6 py-6">
            {/* Introduction */}
            {preview.introduction && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                <p className="text-gray-700">{preview.introduction}</p>
              </div>
            )}

            {/* Highlights */}
            {preview.highlights && preview.highlights.length > 0 && (
              <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
                <h3 className="text-lg font-medium text-yellow-800 mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Top Highlights
                </h3>
                <ul className="space-y-2">
                  {preview.highlights.map((highlight: string, index: number) => (
                    <li key={index} className="text-yellow-700 text-sm">
                      • {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Articles */}
            <div className="space-y-6">
              {preview.items?.map((item: any, index: number) => (
                <article key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-4">
                      {item.article.title}
                    </h3>
                    {item.isHighlight && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Highlight
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-3 flex items-center space-x-4">
                    {item.article.author && (
                      <span>By {item.article.author}</span>
                    )}
                    <span>
                      {new Date(item.article.publishedAt).toLocaleDateString()}
                    </span>
                    <span>{item.article.readingTime || 3} min read</span>
                    {item.article.relevanceScore && (
                      <span>
                        Relevance: {Math.round(item.article.relevanceScore * 100)}%
                      </span>
                    )}
                  </div>

                  {item.article.summary && (
                    <div className="mb-4">
                      <p className="text-gray-700">{item.article.summary}</p>
                    </div>
                  )}

                  {item.article.keyTakeaways && item.article.keyTakeaways.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Key Takeaways:
                      </h5>
                      <ul className="space-y-1">
                        {item.article.keyTakeaways.map((takeaway: string, i: number) => (
                          <li key={i} className="text-sm text-gray-600">
                            • {takeaway}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <a
                      href={item.article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Read Full Article
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                    
                    {item.article.tags && item.article.tags.length > 0 && (
                      <div className="flex space-x-1">
                        {item.article.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Conclusion */}
            {preview.conclusion && (
              <div className="mt-8 p-4 bg-gray-50 rounded border">
                <p className="text-gray-700">{preview.conclusion}</p>
              </div>
            )}
          </div>

          {/* Email Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              This digest was generated by InboxSage AI • 
              <span className="mx-1">•</span>
              Unsubscribe • Preferences
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}