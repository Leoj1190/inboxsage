import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'InboxSage - AI-Powered Newsletter Aggregation',
  description: 'Aggregate newsletters and content from your favorite sources, get AI summaries, and receive clean recaps via email.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}