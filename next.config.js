/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    // 지원하는 언어 로케일 목록
    locales: ['ko', 'en', 'th'],
    // 기본 로케일
    defaultLocale: 'ko',
    // 자동 언어 감지 설정
    localeDetection: true,
  },
  webpack: (config, { isServer }) => {
    // JSON 파일을 모듈로 가져올 수 있도록 설정
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });

    if (!isServer) {
      // 클라이언트 사이드 빌드에서 process 폴리필 제공
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      };
    }
    
    return config;
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://fpfinpuncamlpbbimwtu.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZmlucHVuY2FtbHBiYmltd3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDEwMzQsImV4cCI6MjA1OTE3NzAzNH0.PkUdieMcJbIvReXzmCw-glNQdn2Ni4XdIOHSbYx8hJE'
  },
  eslint: {
    ignoreDuringBuilds: true // 빌드 중 ESLint 검사 비활성화
  },
  typescript: {
    ignoreBuildErrors: true // 빌드 중 TypeScript 오류 무시
  }
};

module.exports = nextConfig; 