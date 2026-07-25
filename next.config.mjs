import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    cpus: 1, // Limit build workers to 1 to prevent database connection exhaustion
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/price',
        destination: '/en/pricing',
        permanent: true,
      },
      {
        source: '/:locale(en|th|cn)/price',
        destination: '/:locale/pricing',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
