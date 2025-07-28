/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true, // ✅ Skip ESLint during production build
    },
  };
  
  module.exports = nextConfig;
  