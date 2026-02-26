import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/simulator',
        destination: 'https://safety-net-simulator.netlify.app',
      },
      {
        source: '/simulator/:path*',
        destination: 'https://safety-net-simulator.netlify.app/:path*',
      },
    ];
  },
};

export default nextConfig;
