/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Static export target (mobile/Capacitor build) needs unoptimized images;
    // harmless for the standard server deploy too.
    unoptimized: true,
  },
};

module.exports = nextConfig;
