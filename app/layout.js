'use client';

import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { useEffect } from 'react';

const WebGLBackground = dynamic(
  () => import('./components/WebGLBackground'),
  { ssr: false }
);

export default function RootLayout({ children }) {
  useEffect(() => {
    // 카카오 SDK 초기화 - 스크립트 로드 대기
    const initKakao = () => {
      if (typeof window !== 'undefined' && window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          // 개발 환경에서는 임시 키 사용
          const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_KEY || '8e4c743e2e4f4b4c8f0e9c9d8e7f6a5b';
          window.Kakao.init(kakaoKey);
          console.log('Kakao SDK initialized');
        }
      } else {
        // SDK가 아직 로드되지 않았으면 조금 기다렸다가 재시도
        setTimeout(initKakao, 100);
      }
    };

    initKakao();
  }, []);

  return (
    <html lang="ko">
      <head>
        <Script
          src="https://developers.kakao.com/sdk/js/kakao.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <WebGLBackground />
        <div className="min-h-screen relative">
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
