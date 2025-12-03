import { NextResponse } from 'next/server';

export async function GET() {
  const KAKAO_CLIENT_ID = process.env.KAKAO_REST_API_KEY; // 이름도 깔끔하게
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tradebot-landing-six.vercel.app';

  const REDIRECT_URI = `${BASE_URL}/api/auth/kakao/callback`;

  const kakaoAuthUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${KAKAO_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code`;

  return NextResponse.redirect(kakaoAuthUrl);
}
