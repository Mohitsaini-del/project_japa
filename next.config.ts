import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev.db is stored at ~/japa-dev.db (outside project root) so Turbopack's
  // file watcher never detects DB writes and triggers unwanted HMR reloads.
  devIndicators: false,
};

export default nextConfig;
