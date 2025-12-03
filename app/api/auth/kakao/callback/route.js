import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/app/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tradebot-landing-f60a28ec7-damdam1.vercel.app/'}/api/auth/kakao/callback`;

    // 1. 토큰 받기
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. 사용자 정보 가져오기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const kakaoUser = await userResponse.json();

    // 3. MongoDB에서 사용자 찾거나 생성
    const client = await clientPromise;
    const db = client.db('trading-bot');
    const usersCollection = db.collection('users');

    const kakaoId = String(kakaoUser.id);
    const email = kakaoUser.kakao_account?.email || `kakao_${kakaoId}@kakao.com`;
    const name = kakaoUser.kakao_account?.profile?.nickname || '카카오 사용자';

    let user = await usersCollection.findOne({ kakaoId });

    if (!user) {
      // 새 사용자 생성
      const result = await usersCollection.insertOne({
        kakaoId,
        email,
        name,
        username: name,
        provider: 'kakao',
        createdAt: new Date(),
        role: 'user',
      });

      user = {
        _id: result.insertedId,
        kakaoId,
        email,
        name,
        username: name,
        provider: 'kakao',
        role: 'user',
      };
    }

    // 4. JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. 쿠키 설정 및 리다이렉트
    const response = NextResponse.redirect(new URL('/community', request.url));
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Kakao OAuth error:', error);
    return NextResponse.redirect(
      new URL('/login?error=kakao_auth_failed', request.url)
    );
  }
}
