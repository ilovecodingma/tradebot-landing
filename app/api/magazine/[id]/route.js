import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import clientPromise from '@/app/lib/mongodb';

// 매거진 상세 조회
export async function GET(request, { params }) {
  try {
    const { id } = await params;
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

    // 조회수 증가
    await magazines.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );

    return NextResponse.json({ magazine: { ...magazine, views: magazine.views + 1 } });
  } catch (error) {
    console.error('Get magazine error:', error);
    return NextResponse.json(
      { error: '매거진을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 매거진 수정 (관리자 전용)
export async function PATCH(request, { params }) {
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

    const { id } = await params;
    const updateData = await request.json();

    const client = await clientPromise;
    const db = client.db('tradebot');
    const magazines = db.collection('magazines');

    const result = await magazines.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '매거진을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '매거진이 수정되었습니다.' });
  } catch (error) {
    console.error('Update magazine error:', error);
    return NextResponse.json(
      { error: '매거진을 수정할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// 매거진 삭제 (관리자 전용)
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

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db('tradebot');
    const magazines = db.collection('magazines');

    const result = await magazines.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: '매거진을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '매거진이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete magazine error:', error);
    return NextResponse.json(
      { error: '매거진을 삭제할 수 없습니다.' },
      { status: 500 }
    );
  }
}
