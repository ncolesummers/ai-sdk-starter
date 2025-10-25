import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PPR disabled - our chat pages are fully dynamic (auth + database queries)
  // and don't benefit from partial prerendering
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
    ],
  },
};

export default nextConfig;
