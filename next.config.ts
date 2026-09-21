import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["austral-festival.vercel.app"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
