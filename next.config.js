/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['api.upbit.com'],
  },
  // 빌드 ID를 타임스탬프로 설정하여 캐시 무효화
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // 캐시 방지 헤더 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
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
