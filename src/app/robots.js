export default function robots() {
  const aiUserAgents = [
    'GPTBot',
    'ChatGPT-User',
    'Google-Extended',
    'PerplexityBot',
    'ClaudeBot',
    'Applebot-Extended'
  ];

  const rules = [
    {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    ...aiUserAgents.map(agent => ({
      userAgent: agent,
      allow: '/',
      disallow: ['/admin/', '/api/'],
    }))
  ];

  return {
    rules,
    sitemap: 'https://www.thatlaundryshop.com/sitemap.xml',
  }
}
