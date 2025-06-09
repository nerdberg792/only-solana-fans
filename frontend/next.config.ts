import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  // next.config.js
 eslint: {
    ignoreDuringBuilds: true,
},
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'pub-1f11ceca0fb246d49409fd54bc65e4be.r2.dev',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'api.dicebear.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'only-solana-fans.onrender.com',
      pathname: '/**',
    }
  ],
  dangerouslyAllowSVG: true
},
}

export default nextConfig

