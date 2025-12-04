import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clientPromise from '@/app/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function POST(request) {
  try {
    const { email, password, name, kakaoId } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('tradebot');
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      email,
      password: hashedPassword,
      name,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (kakaoId) {
      userData.kakaoId = kakaoId;
      userData.kakaoLinkedAt = new Date();
    }

    const result = await users.insertOne(userData);

    // 카카오 회원가입인 경우 자동 로그인 처리
    if (kakaoId) {
      const token = jwt.sign(
        {
          userId: result.insertedId.toString(),
          email: email,
          name: name,
          role: 'user',
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json(
        {
          message: '회원가입이 완료되었습니다.',
          userId: result.insertedId,
          autoLogin: true,
        },
        { status: 201 }
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다.',
        userId: result.insertedId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
