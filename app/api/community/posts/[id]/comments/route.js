import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import clientPromise from '@/app/lib/mongodb';

// 댓글 조회
export async function GET(request, { params }) {
  try {
    const { id } = await params;
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

    return NextResponse.json({ comments: post.comments || [] });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: '댓글을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 작성
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
    const { content } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('tradebot');
    const posts = db.collection('posts');

    const comment = {
      _id: new ObjectId(),
      content,
      authorId: new ObjectId(decoded.userId),
      authorName: decoded.name,
      authorEmail: decoded.email,
      createdAt: new Date()
    };

    const result = await posts.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { comments: comment },
        $inc: { commentCount: 1 }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: '댓글이 작성되었습니다.',
        comment
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: '댓글을 작성할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 삭제
export async function DELETE(request, { params }) {
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
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: '댓글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

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

    const comment = post.comments?.find(c => c._id.toString() === commentId);

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (comment.authorId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: '댓글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    await posts.updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: { comments: { _id: new ObjectId(commentId) } },
        $inc: { commentCount: -1 }
      }
    );

    return NextResponse.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: '댓글을 삭제할 수 없습니다.' },
      { status: 500 }
    );
  }
}
