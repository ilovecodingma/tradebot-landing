const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// .env.local 파일에서 MONGODB_URI 읽기
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('MONGODB_URI=')) {
      const uri = trimmedLine.substring('MONGODB_URI='.length).trim();
      console.log('MongoDB URI 로드됨');
      return uri;
    }
  }
  throw new Error('MONGODB_URI not found in .env.local');
}

async function cleanupDatabase() {
  const MONGODB_URI = loadEnvFile();
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('MongoDB 연결 성공');

    const db = client.db('tradebot');

    // 1. admin이 아닌 모든 사용자 삭제
    const usersResult = await db.collection('users').deleteMany({
      role: { $ne: 'admin' }
    });
    console.log(`✅ ${usersResult.deletedCount}개의 일반 사용자 삭제됨`);

    // 2. 모든 게시글(커뮤니티 포스트) 삭제
    const postsResult = await db.collection('posts').deleteMany({});
    console.log(`✅ ${postsResult.deletedCount}개의 게시글 삭제됨`);

    // 3. 게시글 댓글 삭제
    const commentsResult = await db.collection('comments').deleteMany({});
    console.log(`✅ ${commentsResult.deletedCount}개의 댓글 삭제됨`);

    // 4. 좋아요 삭제
    const likesResult = await db.collection('likes').deleteMany({});
    console.log(`✅ ${likesResult.deletedCount}개의 좋아요 삭제됨`);

    // 5. 북마크 삭제
    const bookmarksResult = await db.collection('bookmarks').deleteMany({});
    console.log(`✅ ${bookmarksResult.deletedCount}개의 북마크 삭제됨`);

    // 매거진은 유지
    const magazineCount = await db.collection('magazines').countDocuments();
    console.log(`ℹ️  ${magazineCount}개의 매거진 유지됨`);

    // 남은 admin 사용자 확인
    const adminUsers = await db.collection('users').find({ role: 'admin' }).toArray();
    console.log('\n✅ 남은 관리자 계정:');
    adminUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });

    console.log('\n🎉 데이터베이스 정리 완료!');

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB 연결 종료');
  }
}

cleanupDatabase();
