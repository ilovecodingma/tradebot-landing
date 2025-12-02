import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { message: '로그아웃되었습니다.' },
    { status: 200 }
  );

  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });

  return response;
}
