import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // REMOVE the env: { ... } block entirely.
  // This allows process.env.GEMINI_API_KEY to be filled by Firebase.

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
