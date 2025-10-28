import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // PPR disabled - our chat pages are fully dynamic (auth + database queries)
  // and don't benefit from partial prerendering
  output: "standalone", // For Docker deployment
  allowedDevOrigins: [
    "http://10.0.1.*:3000",
    "http://localhost:3000",
    "https://10.0.1.*",
  ], // Allow all local network IPs in dev
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
    ],
  },
};

export default nextConfig;
