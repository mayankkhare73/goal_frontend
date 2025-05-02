/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add image domains configuration
  images: {
    domains: ['images.unsplash.com', 'randomuser.me'],
  },
  // Force all pages to be rendered at request time, not during build
  output: 'standalone',
  // Disable static optimization for problematic pages
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['next', 'react', 'react-dom']
  }
};

export default nextConfig;
