import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import clientPromise from '@/app/lib/mongodb';

// 좋아요 토글 (추가/취소)
export async function POST(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = await params;
    const userId = new ObjectId(decoded.userId);

    const client = await clientPromise;
    const db = client.db('tradebot');
    const magazines = db.collection('magazines');

    const magazine = await magazines.findOne({ _id: new ObjectId(id) });

    if (!magazine) {
      return NextResponse.json(
        { error: '매거진을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const likedUsers = magazine.likedUsers || [];
    const hasLiked = likedUsers.some(uid => uid.toString() === userId.toString());

    if (hasLiked) {
      // 좋아요 취소
      await magazines.updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: { likedUsers: userId },
          $inc: { likes: -1 }
        }
      );
      return NextResponse.json({
        message: '좋아요를 취소했습니다.',
        liked: false,
        likes: (magazine.likes || 0) - 1
      });
    } else {
      // 좋아요 추가
      await magazines.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { likedUsers: userId },
          $inc: { likes: 1 }
        }
      );
      return NextResponse.json({
        message: '좋아요를 추가했습니다.',
        liked: true,
        likes: (magazine.likes || 0) + 1
      });
    }
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json(
      { error: '좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 좋아요 상태 확인
export async function GET(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ liked: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = await params;
    const userId = new ObjectId(decoded.userId);

    const client = await clientPromise;
    const db = client.db('tradebot');
    const magazines = db.collection('magazines');

    const magazine = await magazines.findOne({ _id: new ObjectId(id) });

    if (!magazine) {
      return NextResponse.json(
        { error: '매거진을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const likedUsers = magazine.likedUsers || [];
    const liked = likedUsers.some(uid => uid.toString() === userId.toString());

    return NextResponse.json({
      liked,
      likes: magazine.likes || 0
    });
  } catch (error) {
    console.error('Check like error:', error);
    return NextResponse.json({ liked: false });
  }
}
