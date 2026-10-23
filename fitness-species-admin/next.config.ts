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
      {
        protocol: "https",
        hostname: "contents.mediadecathlon.com",
        pathname: "/p*/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn1.gstatic.com",
        pathname: "/shopping",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn1.gstatic.com",
        pathname: "/images",
      },
    ],
  },
};

export default nextConfig;
