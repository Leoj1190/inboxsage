'use client'

import { useState, useEffect } from 'react'
import { Plus, Rss, Edit, Trash2, Play, Pause, Tag } from 'lucide-react'

export default function SourcesPage() {
  const [sources, setSources] = useState([])
  const [topics, setTopics] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [sourcesRes, topicsRes] = await Promise.all([
        fetch('/api/sources'),
        fetch('/api/topics')
      ])
      
      if (sourcesRes.ok) {
        const sourcesData = await sourcesRes.json()
        setSources(sourcesData.sources)
      }
      
      if (topicsRes.ok) {
        const topicsData = await topicsRes.json()
        setTopics(topicsData.topics)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const AddSourceForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      url: '',
      type: 'RSS',
      description: '',
      topicId: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        const response = await fetch('/api/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          setShowAddForm(false)
          loadData()
          setFormData({ name: '', url: '', type: 'RSS', description: '', topicId: '' })
        }
      } catch (error) {
        console.error('Error adding source:', error)
      }
    }

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Add New Source</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="e.g., TechCrunch"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="input"
                placeholder="https://feeds.feedburner.com/TechCrunch"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
              >
                <option value="RSS">RSS Feed</option>
                <option value="NEWSLETTER">Newsletter</option>
                <option value="TWITTER">Twitter</option>
                <option value="MEDIUM">Medium</option>
                <option value="CUSTOM_URL">Custom URL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic (Optional)</label>
              <select
                value={formData.topicId}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                className="input"
              >
                <option value="">No topic</option>
                {topics.map((topic: any) => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={3}
                placeholder="Brief description..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Source
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Content Sources</h1>
          <p className="text-gray-600 mt-1">
            Manage your RSS feeds, newsletters, and other content sources
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </button>
      </div>

      {sources.length === 0 ? (
        <div className="text-center py-12">
          <Rss className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sources added yet</h3>
          <p className="text-gray-500 mb-6">
            Start by adding your favorite RSS feeds, newsletters, or other content sources.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Source
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sources.map((source: any) => (
            <div key={source.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-900 mr-3">
                      {source.name}
                    </h3>
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${source.type === 'RSS' ? 'bg-blue-100 text-blue-800' :
                        source.type === 'NEWSLETTER' ? 'bg-green-100 text-green-800' :
                        source.type === 'TWITTER' ? 'bg-sky-100 text-sky-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {source.type}
                    </span>
                    {source.topic && (
                      <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        <Tag className="h-3 w-3 inline mr-1" />
                        {source.topic.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 break-all"
                  >
                    {source.url}
                  </a>
                  <div className="flex items-center mt-3 text-xs text-gray-500">
                    <span>Articles: {source._count?.articles || 0}</span>
                    {source.lastFetched && (
                      <span className="ml-4">
                        Last fetched: {new Date(source.lastFetched).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    className={`
                      p-2 rounded-lg transition-colors
                      ${source.isActive 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-50'}
                    `}
                    title={source.isActive ? 'Active' : 'Paused'}
                  >
                    {source.isActive ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && <AddSourceForm />}
    </div>
  )
}