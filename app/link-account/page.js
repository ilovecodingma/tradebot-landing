'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LinkAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    const email = searchParams.get('email');
    const maskedEmail = searchParams.get('maskedEmail');
    const createdAt = searchParams.get('createdAt');
    const kakaoId = searchParams.get('kakaoId');
    const name = searchParams.get('name');

    if (!email || !kakaoId) {
      router.push('/login');
      return;
    }

    setAccountInfo({
      email,
      maskedEmail: maskedEmail || email,
      createdAt: createdAt ? new Date(createdAt).toLocaleDateString('ko-KR') : '',
      kakaoId,
      name,
    });
  }, [searchParams, router]);

  const handleLink = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/link-kakao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: accountInfo.email,
          password,
          kakaoId: accountInfo.kakaoId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '계정 연동에 실패했습니다.');
      }

      // 연동 성공 후 커뮤니티로 이동
      router.push('/community');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // 연동 거부 시 회원가입 페이지로
    router.push(`/register?kakaoId=${accountInfo.kakaoId}&email=${encodeURIComponent(accountInfo.email)}&name=${encodeURIComponent(accountInfo.name || '')}`);
  };

  if (!accountInfo) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">기존 계정 발견</h2>
            <p className="mt-2 text-sm text-gray-600">
              카카오 계정과 일치하는 기존 계정을 찾았습니다
            </p>
          </div>

          {/* 기존 계정 정보 표시 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">기존 계정 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">이메일:</span>
                <span className="font-medium text-gray-900">{accountInfo.maskedEmail}</span>
              </div>
              {accountInfo.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">가입일:</span>
                  <span className="font-medium text-gray-900">{accountInfo.createdAt}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>이 계정이 본인의 계정이 맞나요?</strong><br />
              비밀번호를 입력하여 계정을 확인하고 카카오 계정과 연동하세요.
            </p>
          </div>

          <form onSubmit={handleLink} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                기존 계정 비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '연동 중...' : '계정 연동하기'}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={handleSkip}
              className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors"
            >
              다른 계정으로 가입하기
            </button>
          </div>

          <div className="text-center text-sm mt-6">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LinkAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <LinkAccountForm />
    </Suspense>
  );
}
