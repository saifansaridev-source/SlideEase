/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/shipping',
        destination: '/shipping-returns',
        permanent: true,
      },
      {
        source: '/returns',
        destination: '/shipping-returns',
        permanent: true,
      },
      {
        source: '/account',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/account/:path*',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
