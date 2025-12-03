const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://sung2011103:8cnQOshwSfVjz20F@tradingbot.hzfueil.mongodb.net/tradebot?retryWrites=true&w=majority';

async function testConnection() {
  console.log('MongoDB 연결 테스트 시작...');
  console.log('URI:', uri.replace(/:[^:@]+@/, ':****@')); // 비밀번호 숨김

  const client = new MongoClient(uri);

  try {
    console.log('연결 시도 중...');
    await client.connect();
    console.log('✓ MongoDB 연결 성공!');

    const db = client.db('tradebot');
    console.log('✓ 데이터베이스 선택 성공:', db.databaseName);

    // 컬렉션 목록 가져오기
    const collections = await db.listCollections().toArray();
    console.log('✓ 컬렉션 목록:', collections.map(c => c.name));

    // 테스트 데이터 삽입
    const testCollection = db.collection('connection_test');
    const result = await testCollection.insertOne({
      test: true,
      timestamp: new Date()
    });
    console.log('✓ 테스트 데이터 삽입 성공:', result.insertedId);

    // 테스트 데이터 삭제
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✓ 테스트 데이터 삭제 성공');

    console.log('\n모든 테스트 통과! MongoDB가 정상적으로 작동합니다.');
  } catch (error) {
    console.error('✗ MongoDB 연결 실패:', error.message);
    console.error('오류 상세:', error);
  } finally {
    await client.close();
    console.log('연결 종료');
  }
}

testConnection();
