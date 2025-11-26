'use client';

import '../src/index.css';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import dynamic from 'next/dynamic';

const WebGLBackground = dynamic(
  () => import('../src/components/WebGLBackground'),
  { ssr: false }
);

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
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
