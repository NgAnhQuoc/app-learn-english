import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network IP/localhost to avoid Next.js HMR cross-origin warnings
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
