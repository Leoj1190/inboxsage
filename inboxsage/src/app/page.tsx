import { Mail, Brain, Calendar, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">InboxSage</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your AI-Powered
            <span className="text-primary-600"> Newsletter Hub</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Aggregate content from your favorite sources, let AI create intelligent summaries, 
            and receive clean, personalized digests on your schedule.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
              Start Free Trial
            </Link>
            <Link href="#features" className="btn-secondary text-lg px-8 py-3">
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card text-center">
            <Mail className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Aggregation</h3>
            <p className="text-gray-600">
              Connect RSS feeds, newsletters, and social sources in one place.
            </p>
          </div>
          
          <div className="card text-center">
            <Brain className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Summaries</h3>
            <p className="text-gray-600">
              Get intelligent summaries with key takeaways and relevance scoring.
            </p>
          </div>
          
          <div className="card text-center">
            <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Custom Schedule</h3>
            <p className="text-gray-600">
              Receive digests daily, weekly, or on your custom schedule.
            </p>
          </div>
          
          <div className="card text-center">
            <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Clean Delivery</h3>
            <p className="text-gray-600">
              Beautiful HTML emails with organized content and direct links.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Sources</h3>
              <p className="text-gray-600">
                Add your favorite newsletters, RSS feeds, and content sources.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
              <p className="text-gray-600">
                Our AI reads, filters, and summarizes content based on your preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Receive Digest</h3>
              <p className="text-gray-600">
                Get your personalized digest delivered right to your inbox.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-6 w-6 mr-2" />
            <span className="text-xl font-semibold">InboxSage</span>
          </div>
          <p className="text-gray-400">
            Transform your information overload into actionable insights.
          </p>
        </div>
      </footer>
    </div>
  )
}