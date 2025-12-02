import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import clientPromise from '@/app/lib/mongodb';

// 매거진 목록 조회 (모두 접근 가능)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('tradebot');
    const magazines = db.collection('magazines');

    const [magazineList, total] = await Promise.all([
      magazines
        .find({ published: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      magazines.countDocuments({ published: true })
    ]);

    return NextResponse.json({
      magazines: magazineList,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get magazines error:', error);
    return NextResponse.json(
      { error: '매거진을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 매거진 작성 (관리자 전용)
export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { title, content, excerpt, coverImage, category, tags, published } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('tradebot');
    const magazines = db.collection('magazines');

    const result = await magazines.insertOne({
      title,
      content,
      excerpt: excerpt || content.substring(0, 200),
      coverImage: coverImage || null,
      category: category || '일반',
      tags: tags || [],
      authorId: new ObjectId(decoded.userId),
      authorName: decoded.name,
      published: published !== undefined ? published : true,
      views: 0,
      likes: 0,
      likedUsers: [],
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: '매거진이 작성되었습니다.',
        magazineId: result.insertedId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create magazine error:', error);
    return NextResponse.json(
      { error: '매거진을 작성할 수 없습니다.' },
      { status: 500 }
    );
  }
}
