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
  output: 'export',
  // Cấu hình này tạo ra static HTML/CSS/JS thay vì sử dụng Next.js server
  // Điều này sẽ giúp Vercel hiển thị trang web đúng cách
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig