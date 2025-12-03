import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// GET - Fetch ideas with filtering and pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const filter = searchParams.get('filter') || 'all';

    const client = await clientPromise;
    const db = client.db('trading-bot');
    const ideasCollection = db.collection('ideas');

    // Build query based on filter
    const query = {};
    if (filter === 'long') {
      query.position = 'long';
    } else if (filter === 'short') {
      query.position = 'short';
    }

    const skip = (page - 1) * limit;

    const ideas = await ideasCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await ideasCollection.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      ideas,
      totalPages,
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Failed to fetch ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}

// POST - Create new idea
export async function POST(request) {
  try {
    // Check authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const client = await clientPromise;
    const db = client.db('trading-bot');
    const ideasCollection = db.collection('ideas');
    const usersCollection = db.collection('users');

    // Get user info
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { username: 1 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      symbol,
      timeframe,
      position,
      description,
      analysis,
      entryPrice,
      targetPrice,
      stopLoss,
      chartImage
    } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: '제목을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: '설명을 입력해주세요.' },
        { status: 400 }
      );
    }

    // Create idea
    const idea = {
      title: title.trim(),
      symbol: symbol?.trim() || '',
      timeframe: timeframe || '1D',
      position: position || 'long',
      description: description.trim(),
      analysis: analysis?.trim() || '',
      entryPrice: entryPrice || '',
      targetPrice: targetPrice || '',
      stopLoss: stopLoss || '',
      chartImage: chartImage || '',
      authorId: new ObjectId(userId),
      authorName: user.username,
      views: 0,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await ideasCollection.insertOne(idea);

    return NextResponse.json(
      {
        message: '아이디어가 공유되었습니다.',
        ideaId: result.insertedId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create idea:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: '인증에 실패했습니다.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: '아이디어 공유에 실패했습니다.' },
      { status: 500 }
    );
  }
}
