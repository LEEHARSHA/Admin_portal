import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.myprotein.co.in",
        pathname: "/images",
      },
      {
        protocol: "https",
        hostname: "img.tatacliq.com",
        pathname: "/images/i26/**",
      },
    ],
  },
};

export default nextConfig;
