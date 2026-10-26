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
      // YouTube thumbnails for Resource Library videos, served from our own
      // image optimizer so visitors don't load anything from YouTube.
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
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
  // The Safety Net Simulator is a self-contained build served from
  // public/simulator/index.html. Never edit that file by hand; replace it with
  // a new build. /simulator/ already redirects here (Next's trailing-slash 308).
  async rewrites() {
    return [{ source: '/simulator', destination: '/simulator/index.html' }];
  },
  // The simulator build compiles its JSX in the browser (Babel) and loads React,
  // Tailwind and Google Fonts from CDNs, so it needs inline scripts and eval.
  // This policy allows exactly that, on the simulator only.
  async headers() {
    const simulatorHeaders = [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.tailwindcss.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob:",
          "connect-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'self'",
        ].join('; '),
      },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ];
    return [
      { source: '/simulator', headers: simulatorHeaders },
      { source: '/simulator/index.html', headers: simulatorHeaders },
    ];
  },
};

export default nextConfig;
