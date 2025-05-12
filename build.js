const fs = require('fs');
const { execSync } = require('child_process');

// Xóa các file cấu hình cũ nếu có
try {
  if (fs.existsSync('next.config.mjs')) {
    fs.unlinkSync('next.config.mjs');
    console.log('Removed next.config.mjs');
  }
} catch (err) {
  console.error('Error removing next.config.mjs:', err);
}

// Tạo file cấu hình mới
const nextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
}

module.exports = nextConfig
`;

try {
  fs.writeFileSync('next.config.js', nextConfig);
  console.log('Created next.config.js');
} catch (err) {
  console.error('Error creating next.config.js:', err);
}

// Chạy lệnh build
try {
  console.log('Running Next.js build...');
  execSync('npx next build', { stdio: 'inherit' });
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}