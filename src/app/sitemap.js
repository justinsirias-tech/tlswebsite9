import prisma from '../lib/prisma';

export default async function sitemap() {
  const baseUrl = 'https://www.thatlaundryshop.com';
  const locales = ['en', 'th', 'cn'];

  // Fetch dynamic content with try/catch to prevent build-time DB timeouts on Vercel
  let articles = [];
  let locations = [];
  try {
    articles = await prisma.article.findMany();
    locations = await prisma.location.findMany();
  } catch (err) {
    console.error("Warning: Database was unreachable during sitemap generation at build time. Falling back to static pages.", err.message);
  }

  const sitemapEntries = [];

  // 1. Static Pages for each locale
  const staticPages = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/booking', changeFrequency: 'yearly', priority: 0.9 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/about', changeFrequency: 'yearly', priority: 0.7 },
    { path: '/articles', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/hotels', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/condominiums', changeFrequency: 'weekly', priority: 0.8 },
  ];

  for (const locale of locales) {
    for (const page of staticPages) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  // 2. Dynamic Articles for each locale
  for (const article of articles) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/articles/${article.id}`,
        lastModified: article.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // 3. Dynamic Locations (Hotels / Condos) for each locale
  for (const location of locations) {
    const section = location.type === 'condo' ? 'condominiums' : 'hotels';
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/${section}/${location.slug}`,
        lastModified: location.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return sitemapEntries;
}
