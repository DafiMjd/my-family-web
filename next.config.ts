import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "76.13.192.114",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "76.13.192.114",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
