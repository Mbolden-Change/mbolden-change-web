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
  // Old page addresses still linked from emails and funder decks. Off until
  // What We're Tackling is live in production: set
  // ENABLE_SITE_REFRESH_REDIRECTS=true in that environment and redeploy.
  // Temporary (307) for now; switch to permanent once the refresh settles.
  async redirects() {
    if (process.env.ENABLE_SITE_REFRESH_REDIRECTS !== 'true') return [];
    return [
      { source: '/our-work', destination: '/what-were-tackling', permanent: false },
      { source: '/fueling-bold-change', destination: '/what-were-tackling', permanent: false },
      { source: '/ideas-in-action', destination: 'https://www.mboldenaction.org', permanent: false },
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
