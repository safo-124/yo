/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // This line solves the "Can't resolve 'fs'" issue by ignoring the fs module
    // in browser bundles, since we only use it in server components now
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

export default nextConfig;
