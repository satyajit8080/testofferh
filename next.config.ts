import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export for plain hosting (cPanel / Apache). Output goes to /out.
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  // Emit /status/index.html etc. so plain Apache serves clean URLs.
  trailingSlash: true,
};

export default nextConfig;
