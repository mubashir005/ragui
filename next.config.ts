import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static export for GitHub Pages
  images: {
    unoptimized: true, // GitHub Pages doesn't support Next.js Image Optimization
  },
  basePath: process.env.NODE_ENV === 'production' ? '/rag-ui' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/rag-ui/' : '',
};

export default nextConfig;
