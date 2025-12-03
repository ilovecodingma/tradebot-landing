import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// GET - Fetch single idea with view increment
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '잘못된 아이디어 ID입니다.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('trading-bot');
    const ideasCollection = db.collection('ideas');

    // Increment view count
    await ideasCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );

    const idea = await ideasCollection.findOne({ _id: new ObjectId(id) });

    if (!idea) {
      return NextResponse.json(
        { error: '아이디어를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ idea });
  } catch (error) {
    console.error('Failed to fetch idea:', error);
    return NextResponse.json(
      { error: 'Failed to fetch idea' },
      { status: 500 }
    );
  }
}

// PUT - Update idea
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '잘못된 아이디어 ID입니다.' },
        { status: 400 }
      );
    }

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

    // Check if idea exists and user is the author
    const idea = await ideasCollection.findOne({ _id: new ObjectId(id) });
    if (!idea) {
      return NextResponse.json(
        { error: '아이디어를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (idea.authorId.toString() !== userId) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
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

    // Update idea
    await ideasCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
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
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ message: '아이디어가 수정되었습니다.' });
  } catch (error) {
    console.error('Failed to update idea:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: '인증에 실패했습니다.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: '아이디어 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE - Delete idea
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '잘못된 아이디어 ID입니다.' },
        { status: 400 }
      );
    }

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

    // Check if idea exists and user is the author
    const idea = await ideasCollection.findOne({ _id: new ObjectId(id) });
    if (!idea) {
      return NextResponse.json(
        { error: '아이디어를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (idea.authorId.toString() !== userId) {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    await ideasCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: '아이디어가 삭제되었습니다.' });
  } catch (error) {
    console.error('Failed to delete idea:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: '인증에 실패했습니다.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: '아이디어 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST - Handle likes/comments
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '잘못된 아이디어 ID입니다.' },
        { status: 400 }
      );
    }

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

    const body = await request.json();
    const { action, comment } = body;

    if (action === 'like') {
      const idea = await ideasCollection.findOne({ _id: new ObjectId(id) });
      if (!idea) {
        return NextResponse.json(
          { error: '아이디어를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      const hasLiked = idea.likedBy?.includes(userId);

      if (hasLiked) {
        // Unlike
        await ideasCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $pull: { likedBy: userId },
            $inc: { likes: -1 }
          }
        );
        return NextResponse.json({ liked: false });
      } else {
        // Like
        await ideasCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $addToSet: { likedBy: userId },
            $inc: { likes: 1 }
          }
        );
        return NextResponse.json({ liked: true });
      }
    } else if (action === 'comment') {
      if (!comment || !comment.trim()) {
        return NextResponse.json(
          { error: '댓글 내용을 입력해주세요.' },
          { status: 400 }
        );
      }

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

      const newComment = {
        _id: new ObjectId(),
        authorId: userId,
        authorName: user.username,
        content: comment.trim(),
        createdAt: new Date()
      };

      await ideasCollection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { comments: newComment } }
      );

      return NextResponse.json({
        message: '댓글이 작성되었습니다.',
        comment: newComment
      });
    }

    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to process action:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: '인증에 실패했습니다.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: '요청 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
