import prisma from '../lib/prisma';

export default async function sitemap() {
  const baseUrl = 'https://www.thatlaundryshop.com';

  // Fetch dynamic content
  const articles = await prisma.article.findMany();
  const locations = await prisma.location.findMany();

  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.id}`,
    lastModified: article.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const locationUrls = locations.map((location) => ({
    url: `${baseUrl}/hotels/${location.slug}`,
    lastModified: location.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hotels`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...articleUrls,
    ...locationUrls,
  ];
}
