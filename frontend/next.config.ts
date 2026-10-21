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
  // Old page addresses still linked from emails and funder decks. Temporary
  // (307) until the new pages are live in production; switch to permanent then.
  async redirects() {
    return [
      { source: '/our-work', destination: '/what-were-tackling', permanent: false },
      { source: '/fueling-bold-change', destination: '/what-were-tackling', permanent: false },
      { source: '/ideas-in-action', destination: '/mbolden-action', permanent: false },
    ];
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
