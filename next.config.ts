import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许手机通过局域网 IP 访问时加载 CSS/JS（否则无样式）
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.0.113",
    "192.168.1.1",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

export default nextConfig;
