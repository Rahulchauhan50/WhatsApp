/** @type {import('next').NextConfig} */
const imageDomains = process.env.IMAGE_DOMAINS
  ? process.env.IMAGE_DOMAINS.split(',')
  : [];

const nextConfig = {
  reactStrictMode: false,
  env:{
    NEXT_PUBLIC_ZEGO_APP_ID:"366589160",
    NEXT_PUBLIC_ZEGO_SERVER_ID:"b53e2b1c2246bbb3626d71b9bc55fdb8"
  },
    images: {
    remotePatterns: [
      ...imageDomains.map((domain) => ({
        protocol: 'https',
        hostname: domain.trim(),
        port: '',
        pathname: '/**',
      })),

      // ✅ Explicit rule for localhost (your missing piece)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;