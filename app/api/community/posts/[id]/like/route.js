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
    const posts = db.collection('posts');

    const post = await posts.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 좋아요 배열이 없으면 초기화
    const likedUsers = post.likedUsers || [];
    const hasLiked = likedUsers.some(uid => uid.toString() === userId.toString());

    if (hasLiked) {
      // 좋아요 취소
      await posts.updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: { likedUsers: userId },
          $inc: { likes: -1 }
        }
      );
      return NextResponse.json({
        message: '좋아요를 취소했습니다.',
        liked: false,
        likes: (post.likes || 0) - 1
      });
    } else {
      // 좋아요 추가
      await posts.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { likedUsers: userId },
          $inc: { likes: 1 }
        }
      );
      return NextResponse.json({
        message: '좋아요를 추가했습니다.',
        liked: true,
        likes: (post.likes || 0) + 1
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
    const posts = db.collection('posts');

    const post = await posts.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const likedUsers = post.likedUsers || [];
    const liked = likedUsers.some(uid => uid.toString() === userId.toString());

    return NextResponse.json({
      liked,
      likes: post.likes || 0
    });
  } catch (error) {
    console.error('Check like error:', error);
    return NextResponse.json({ liked: false });
  }
}
