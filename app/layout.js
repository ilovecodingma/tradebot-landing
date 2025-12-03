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
    // 카카오 SDK 초기화
    if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_KEY || 'YOUR_KAKAO_APP_KEY');
    }
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
