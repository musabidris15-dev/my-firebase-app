
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This part fixes the "Invalid src prop" image error
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  // This part keeps your connection working
  allowedDevOrigins: [
    "9005-firebase-studio-1761077070485.cluster-cbeiita7rbe7iuwhvjs5zww2i4.cloudworkstations.dev"
  ],
};

export default nextConfig;
