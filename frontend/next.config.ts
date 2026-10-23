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
      // Substack cover photos for the Point of View block (see lib/substack.ts).
      {
        protocol: 'https',
        hostname: 'substack-post-media.s3.amazonaws.com',
        pathname: '/public/images/**',
      },
      {
        protocol: 'https',
        hostname: 'substackcdn.com',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'bucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com',
        pathname: '/public/images/**',
      },
    ],
  },
  // Old page addresses still linked from emails and funder decks.
  // Temporary (307) for now; switch to permanent once the refresh settles.
  async redirects() {
    return [
      { source: '/our-work', destination: '/what-were-tackling', permanent: false },
      { source: '/fueling-bold-change', destination: '/what-were-tackling', permanent: false },
      { source: '/ideas-in-action', destination: 'https://www.mboldenaction.org', permanent: false },
      // The old case study and report now live in Ready to Grow: permanent 301s
      // (statusCode, since `permanent: true` would send a 308).
      {
        source: '/case-study/my-new-red-shoes-youth-cash-transfer-program',
        destination: '/ready-to-grow/youth-cash-transfer',
        statusCode: 301,
      },
      {
        source: '/report/uplifting-immigrant-survivors-project-empower-report',
        destination: '/ready-to-grow/project-empower',
        statusCode: 301,
      },
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
