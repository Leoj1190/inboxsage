'use client'

import { useState, useEffect } from 'react'
import { Save, TestTube, Clock, Brain, Mail, User, Shield } from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('schedule')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user.profile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      
      if (response.ok) {
        // Show success message
        console.log('Settings saved successfully')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const sendTestEmail = async () => {
    try {
      const response = await fetch('/api/digest/test', {
        method: 'POST'
      })
      
      if (response.ok) {
        alert('Test email sent successfully!')
      } else {
        alert('Failed to send test email')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      alert('Failed to send test email')
    }
  }

  const tabs = [
    { id: 'schedule', name: 'Schedule', icon: Clock },
    { id: 'ai', name: 'AI Settings', icon: Brain },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'account', name: 'Account', icon: User },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Customize your digest preferences and account settings
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={sendTestEmail}
            className="btn-secondary flex items-center"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test Email
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left
                  ${activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card">
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Digest Schedule</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={profile?.scheduleType || 'WEEKLY'}
                    onChange={(e) => setProfile({ ...profile, scheduleType: e.target.value })}
                    className="input max-w-xs"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time of Day
                  </label>
                  <select
                    value={profile?.timeOfDay || 9}
                    onChange={(e) => setProfile({ ...profile, timeOfDay: parseInt(e.target.value) })}
                    className="input max-w-xs"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={profile?.timezone || 'UTC'}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="input max-w-xs"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">AI Preferences</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary Depth
                  </label>
                  <select
                    value={profile?.summaryDepth || 'BASIC'}
                    onChange={(e) => setProfile({ ...profile, summaryDepth: e.target.value })}
                    className="input max-w-xs"
                  >
                    <option value="BASIC">Basic (2-3 sentences)</option>
                    <option value="DEEP">Deep (detailed analysis)</option>
                    <option value="EXTRACTIVE">Extractive (key quotes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format Style
                  </label>
                  <select
                    value={profile?.summaryFormat || 'MIXED'}
                    onChange={(e) => setProfile({ ...profile, summaryFormat: e.target.value })}
                    className="input max-w-xs"
                  >
                    <option value="BULLETS">Bullet Points</option>
                    <option value="PARAGRAPHS">Paragraphs</option>
                    <option value="MIXED">Mixed Format</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Writing Style
                  </label>
                  <select
                    value={profile?.summaryStyle || 'PROFESSIONAL'}
                    onChange={(e) => setProfile({ ...profile, summaryStyle: e.target.value })}
                    className="input max-w-xs"
                  >
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="CASUAL">Casual</option>
                    <option value="WITTY">Witty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Articles per Digest
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={profile?.maxItemsPerDigest || 20}
                    onChange={(e) => setProfile({ ...profile, maxItemsPerDigest: parseInt(e.target.value) })}
                    className="input max-w-xs"
                  />
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Email Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digest Email Addresses
                  </label>
                  <textarea
                    value={profile?.digestEmails?.join('\n') || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      digestEmails: e.target.value.split('\n').filter(email => email.trim()) 
                    })}
                    className="input"
                    rows={4}
                    placeholder="Enter email addresses (one per line)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    You can add multiple email addresses to receive digests
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeImages"
                      checked={profile?.includeImages || false}
                      onChange={(e) => setProfile({ ...profile, includeImages: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeImages" className="ml-2 text-sm text-gray-700">
                      Include images in digest emails
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeVideos"
                      checked={profile?.includeVideos || false}
                      onChange={(e) => setProfile({ ...profile, includeVideos: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeVideos" className="ml-2 text-sm text-gray-700">
                      Include video content
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language Preference
                  </label>
                  <select
                    value={profile?.languagePreference || 'en'}
                    onChange={(e) => setProfile({ ...profile, languagePreference: e.target.value })}
                    className="input max-w-xs"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                  </select>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Data & Privacy</h4>
                  <div className="space-y-4">
                    <button className="btn-secondary text-left">
                      Export my data
                    </button>
                    <button className="text-red-600 hover:text-red-700 text-sm">
                      Delete my account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}