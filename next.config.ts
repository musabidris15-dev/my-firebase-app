import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. FORCE the key here. This makes process.env.GEMINI_API_KEY work globally.
  env: {
    GEMINI_API_KEY: 'AIzaSyBSKQELnvS2Hnqiev8U4w1DhWEnLfBPfOk',
  },
  // 2. Your image settings
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
