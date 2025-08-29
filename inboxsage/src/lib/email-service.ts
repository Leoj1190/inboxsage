import { Resend } from 'resend'
import { EmailDigestData } from '@/types'

export class EmailService {
  private resend: Resend

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Resend API key is required')
    }
    
    this.resend = new Resend(process.env.RESEND_API_KEY)
  }

  /**
   * Send digest email to user
   */
  async sendDigest(emailData: EmailDigestData): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
      const html = this.generateDigestHTML(emailData)
      
      const response = await this.resend.emails.send({
        from: 'InboxSage <digest@inboxsage.com>',
        to: emailData.user.email,
        subject: emailData.digest.title,
        html: html,
        headers: {
          'List-Unsubscribe': `<${emailData.unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
      })

      if (response.error) {
        return { success: false, error: response.error.message }
      }

      return { success: true, emailId: response.data?.id }

    } catch (error) {
      console.error('Email sending error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(to: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.resend.emails.send({
        from: 'InboxSage <test@inboxsage.com>',
        to: to,
        subject: 'InboxSage Test Email',
        html: this.generateTestEmailHTML(name)
      })

      if (response.error) {
        return { success: false, error: response.error.message }
      }

      return { success: true }

    } catch (error) {
      console.error('Test email error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Generate HTML for digest email
   */
  private generateDigestHTML(data: EmailDigestData): string {
    const { user, digest, items, unsubscribeUrl, preferencesUrl } = data

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${digest.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8fafc;
    }
    .container {
      background-color: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e2e8f0;
    }
    .logo {
      color: #3b82f6;
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .title {
      color: #1e293b;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }
    .date {
      color: #64748b;
      font-size: 14px;
      margin-top: 8px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 24px;
      color: #334155;
    }
    .introduction {
      background-color: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 32px;
      border-left: 4px solid #3b82f6;
    }
    .highlights {
      background-color: #fef3c7;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 32px;
      border-left: 4px solid #f59e0b;
    }
    .highlights h3 {
      color: #92400e;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .highlights ul {
      margin: 0;
      padding-left: 20px;
    }
    .highlights li {
      margin-bottom: 8px;
    }
    .article {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      background-color: #ffffff;
    }
    .article-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
      text-decoration: none;
    }
    .article-title:hover {
      color: #3b82f6;
    }
    .article-meta {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 12px;
    }
    .article-summary {
      color: #475569;
      margin-bottom: 12px;
    }
    .article-takeaways {
      background-color: #f8fafc;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    .article-takeaways h5 {
      margin: 0 0 8px 0;
      color: #374151;
      font-size: 14px;
    }
    .article-takeaways ul {
      margin: 0;
      padding-left: 16px;
      font-size: 14px;
    }
    .read-more {
      background-color: #3b82f6;
      color: white;
      padding: 8px 16px;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      display: inline-block;
    }
    .read-more:hover {
      background-color: #2563eb;
    }
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .tag {
      background-color: #e0f2fe;
      color: #0369a1;
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 11px;
      margin-right: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🧠 InboxSage</div>
      <h1 class="title">${digest.title}</h1>
      <div class="date">${new Date(digest.generatedAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</div>
    </div>

    <div class="greeting">
      Hello ${user.name},
    </div>

    ${digest.introduction ? `
    <div class="introduction">
      <p>${digest.introduction}</p>
    </div>
    ` : ''}

    ${digest.highlights && digest.highlights.length > 0 ? `
    <div class="highlights">
      <h3>🌟 Top Highlights</h3>
      <ul>
        ${digest.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="articles">
      ${items.map(item => {
        const article = item.article
        return `
        <div class="article">
          <a href="${article.url}" class="article-title" target="_blank">
            ${article.title}
          </a>
          <div class="article-meta">
            ${article.author ? `By ${article.author} • ` : ''}
            ${new Date(article.publishedAt).toLocaleDateString()} • 
            ${article.readingTime || 3} min read
            ${article.relevanceScore ? ` • Relevance: ${Math.round(article.relevanceScore * 100)}%` : ''}
          </div>
          
          ${article.summary ? `
          <div class="article-summary">
            ${article.summary}
          </div>
          ` : ''}
          
          ${article.keyTakeaways && article.keyTakeaways.length > 0 ? `
          <div class="article-takeaways">
            <h5>Key Takeaways:</h5>
            <ul>
              ${article.keyTakeaways.map(takeaway => `<li>${takeaway}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          
          <div style="margin-bottom: 12px;">
            ${article.tags ? article.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
          </div>
          
          <a href="${article.url}" class="read-more" target="_blank">Read Full Article</a>
        </div>
        `
      }).join('')}
    </div>

    ${digest.conclusion ? `
    <div class="introduction">
      <p>${digest.conclusion}</p>
    </div>
    ` : ''}

    <div class="footer">
      <p>
        This digest was generated by InboxSage AI<br>
        <a href="${preferencesUrl}">Update preferences</a> • 
        <a href="${unsubscribeUrl}">Unsubscribe</a>
      </p>
      <p style="margin-top: 16px;">
        © ${new Date().getFullYear()} InboxSage. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `
  }

  /**
   * Generate test email HTML
   */
  private generateTestEmailHTML(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>InboxSage Test Email</title>
</head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #3b82f6;">🧠 InboxSage</h1>
    <h2>Test Email Successful!</h2>
  </div>
  
  <p>Hello ${name},</p>
  
  <p>This is a test email to confirm that your InboxSage email configuration is working correctly.</p>
  
  <p>You should start receiving your personalized digest emails according to your schedule preferences.</p>
  
  <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">What's Next?</h3>
    <ul>
      <li>Add your favorite RSS feeds and content sources</li>
      <li>Organize sources into topics</li>
      <li>Customize your AI summary preferences</li>
      <li>Set your preferred digest schedule</li>
    </ul>
  </div>
  
  <p>Thank you for using InboxSage!</p>
  
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
    <p>© ${new Date().getFullYear()} InboxSage. All rights reserved.</p>
  </div>
</body>
</html>
    `
  }
}