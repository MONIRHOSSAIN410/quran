/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static-site generation: every route is pre-rendered at build time
  // into plain HTML/CSS/JS (no Node server required to serve the site).
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
