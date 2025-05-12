/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  // Đảm bảo không có output: 'export'
  // Thêm cấu hình cho i18n
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  // Đảm bảo không có basePath
}

module.exports = nextConfig