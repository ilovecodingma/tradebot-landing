'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - 페이지를 찾을 수 없습니다</h1>
        <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
          ← 홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
