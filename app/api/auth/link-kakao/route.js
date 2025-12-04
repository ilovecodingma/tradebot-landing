import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clientPromise from '@/app/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function POST(request) {
  try {
    const { email, password, kakaoId } = await request.json();

    if (!email || !password || !kakaoId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('tradebot');
    const usersCollection = db.collection('users');

    // 이메일로 기존 회원 찾기
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: '계정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 카카오 연동된 계정인지 확인
    if (user.kakaoId) {
      return NextResponse.json(
        { error: '이미 카카오 계정이 연동되어 있습니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // 카카오 계정 연동
    await usersCollection.updateOne(
      { email },
      {
        $set: {
          kakaoId,
          kakaoLinkedAt: new Date(),
        },
      }
    );

    // JWT 토큰 생성
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

    // 쿠키 설정 및 응답
    const response = NextResponse.json(
      { message: '카카오 계정 연동이 완료되었습니다.' },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Link Kakao error:', error);
    return NextResponse.json(
      { error: '계정 연동에 실패했습니다.' },
      { status: 500 }
    );
  }
}
