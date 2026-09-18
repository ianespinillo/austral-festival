import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["mesa-pdf-indoor-ing.trycloudflare.com"],
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
