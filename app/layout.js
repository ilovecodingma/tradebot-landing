'use client';

import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import dynamic from 'next/dynamic';

const WebGLBackground = dynamic(
  () => import('./components/WebGLBackground'),
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
