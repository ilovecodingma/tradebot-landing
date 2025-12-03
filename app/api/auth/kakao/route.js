import { NextResponse } from 'next/server';

// 카카오 OAuth 로그인 시작
export async function GET(request) {
  const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tradebot-landing-six.vercel.app/'}/api/auth/kakao/callback`;

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;

  return NextResponse.redirect(kakaoAuthUrl);
}
