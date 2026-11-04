import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Merged duplicate phone pages: old URLs point to the kept page (308 permanent)
  async redirects() {
    return [
      { source: '/phones/poco-x6-pro-5g', destination: '/phones/poco-x6-pro', permanent: true },
      { source: '/phones/poco-f6-5g', destination: '/phones/poco-f6', permanent: true },
      { source: '/phones/poco-f6-pro-5g', destination: '/phones/poco-f6-pro', permanent: true },
    ]
  },
  images: {
    // Allowlist remote host patterns (kept existing)
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'rukminim2.flixcart.com',
      },
      {
        protocol: 'https',
        hostname: 'exstatic-in.vivo.com',
      },
      {
        protocol: 'https',
        hostname: 'static.realme.net',
      },
      {
        protocol: 'https',
        hostname: 'fdn2.gsmarena.com',
      },
    ],
  },
};

export default nextConfig;
