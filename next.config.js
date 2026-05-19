/** @type {import('next').NextConfig} */
const isGhPages = process.env.GITHUB_PAGES === "true";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isGhPages && repo ? `/${repo}` : undefined,
  assetPrefix: isGhPages && repo ? `/${repo}/` : undefined,
};

module.exports = nextConfig;
