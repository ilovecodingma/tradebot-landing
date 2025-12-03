import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import clientPromise from '@/app/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || 'all';
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('tradebot');
    const posts = db.collection('posts');

    // Build query based on category
    const query = {};
    if (category !== 'all') {
      query.category = category;
    }

    const [postsList, total] = await Promise.all([
      posts
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      posts.countDocuments(query)
    ]);

    return NextResponse.json({
      posts: postsList,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: '게시글을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

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
    const { title, content, category, images } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('tradebot');
    const posts = db.collection('posts');

    const result = await posts.insertOne({
      title,
      content,
      category: category || 'general',
      images: images || [],
      authorId: new ObjectId(decoded.userId),
      authorName: decoded.name,
      authorEmail: decoded.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
      comments: []
    });

    return NextResponse.json(
      {
        message: '게시글이 작성되었습니다.',
        postId: result.insertedId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: '게시글을 작성할 수 없습니다.' },
      { status: 500 }
    );
  }
}
