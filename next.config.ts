
import type {NextConfig} from 'next';
import 'dotenv/config'

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pomf2.lain.la',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    buildHttp: true,
  }
};

export default nextConfig;
