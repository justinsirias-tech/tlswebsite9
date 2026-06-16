import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1, // Limit build workers to 1 to prevent database connection exhaustion
  }
};

export default withNextIntl(nextConfig);
