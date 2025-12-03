import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clientPromise from '@/app/lib/mongodb';

export async function POST(request) {
  try {
    console.log('[LOGIN] Request received');
    console.log('[LOGIN] Environment check:', {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAdminEmail: !!process.env.ADMIN_EMAIL
    });

    const { email, password } = await request.json();
    console.log('[LOGIN] Email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('tradebot');
    const users = db.collection('users');

    const user = await users.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 관리자 이메일 체크 및 role 업데이트
    const isAdmin = email === process.env.ADMIN_EMAIL;
    const userRole = user.role || 'user';

    // 관리자인데 role이 admin이 아니면 업데이트
    if (isAdmin && userRole !== 'admin') {
      await users.updateOne(
        { _id: user._id },
        { $set: { role: 'admin', updatedAt: new Date() } }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: isAdmin ? 'admin' : userRole
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      {
        message: '로그인 성공',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: isAdmin ? 'admin' : userRole
        }
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    console.error('[LOGIN] Error message:', error.message);
    console.error('[LOGIN] Error stack:', error.stack);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}
