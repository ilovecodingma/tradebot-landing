/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['api.upbit.com'],
  },
  webpack: (config) => {
    // CSV 파일을 raw text로 로드
    config.module.rules.push({
      test: /\.csv$/,
      use: 'raw-loader',
    });

    return config;
  },
};

module.exports = nextConfig;
