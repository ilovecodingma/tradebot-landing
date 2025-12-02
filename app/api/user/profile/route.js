import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import clientPromise from '@/app/lib/mongodb';

// 내 프로필 조회
export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const client = await clientPromise;
    const db = client.db('tradebot');
    const users = db.collection('users');
    const posts = db.collection('posts');

    const user = await users.findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 내가 쓴 게시글 수
    const postCount = await posts.countDocuments({
      authorId: new ObjectId(decoded.userId)
    });

    // 내가 쓴 최근 게시글
    const recentPosts = await posts
      .find({ authorId: new ObjectId(decoded.userId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      user: {
        ...user,
        postCount
      },
      recentPosts
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: '프로필을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 프로필 수정
export async function PATCH(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, bio } = await request.json();

    const client = await clientPromise;
    const db = client.db('tradebot');
    const users = db.collection('users');

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    updateData.updatedAt = new Date();

    const result = await users.updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 게시글의 작성자 이름도 업데이트
    if (name) {
      const posts = db.collection('posts');
      await posts.updateMany(
        { authorId: new ObjectId(decoded.userId) },
        { $set: { authorName: name } }
      );
    }

    return NextResponse.json({ message: '프로필이 수정되었습니다.' });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: '프로필을 수정할 수 없습니다.' },
      { status: 500 }
    );
  }
}
