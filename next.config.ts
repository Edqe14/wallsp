import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'raw.githubusercontent.com',
      },
    ],
    minimumCacheTTL: 31_536_000, // 1 year
  },
};

export default nextConfig;
