import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Disable App Router specific features if strictly needed,
  // but output: 'export' handles most compatibility requirements for SSG.
};

export default nextConfig;
