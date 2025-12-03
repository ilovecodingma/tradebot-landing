import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    const client = await clientPromise;
    const db = client.db('tradebot');
    const users = db.collection('users');

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // 비밀번호 제외
    );

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: '사용자 정보를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
