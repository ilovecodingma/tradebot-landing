const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load environment variables FIRST
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'tradebot';

console.log('Using MongoDB URI:', uri.substring(0, 30) + '...');

async function migrateMagazines() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const magazines = db.collection('magazines');
    const users = db.collection('users');

    // Step 1: Create admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tradebot.com';
    const existingAdmin = await users.findOne({ email: adminEmail });

    let adminId;
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = {
        email: adminEmail,
        password: hashedPassword,
        name: '관리자',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await users.insertOne(adminUser);
      adminId = result.insertedId;
      console.log(`✓ Created admin user: ${adminEmail} (password: admin123)`);
    } else {
      adminId = existingAdmin._id;
      // Update role to admin if not already
      if (existingAdmin.role !== 'admin') {
        await users.updateOne(
          { _id: existingAdmin._id },
          { $set: { role: 'admin', updatedAt: new Date() } }
        );
        console.log(`✓ Updated ${adminEmail} role to admin`);
      } else {
        console.log(`○ Admin user already exists: ${adminEmail}`);
      }
    }

    // Step 2: Migrate magazines
    const postsPath = path.join(__dirname, 'app', 'data', 'posts.json');
    const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

    console.log(`\nFound ${postsData.length} posts to migrate`);

    for (const post of postsData) {
      // Convert post to magazine format
      const magazine = {
        title: post.title,
        content: convertContentToText(post.content),
        excerpt: post.excerpt,
        coverImage: post.thumbnail || '',
        category: mapCategory(post.category),
        tags: post.tags || [],
        authorName: '관리자',
        authorId: adminId,
        published: true,
        views: 0,
        likes: 0,
        likedUsers: [],
        commentCount: 0,
        comments: [],
        createdAt: new Date(post.date),
        updatedAt: new Date(post.date)
      };

      // Check if already exists
      const existing = await magazines.findOne({ title: magazine.title });

      if (!existing) {
        await magazines.insertOne(magazine);
        console.log(`✓ Migrated: ${magazine.title}`);
      } else {
        console.log(`○ Skipped (already exists): ${magazine.title}`);
      }
    }

    console.log('\n✅ Migration completed!');

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await client.close();
  }
}

function convertContentToText(content) {
  if (typeof content === 'string') return content;

  let text = '';

  if (content.sections) {
    content.sections.forEach(section => {
      text += `\n\n## ${section.title}\n\n`;

      if (section.content) {
        text += section.content + '\n';
      }

      if (section.subsections) {
        section.subsections.forEach(subsection => {
          text += `\n### ${subsection.subtitle}\n\n`;
          text += subsection.content + '\n';
        });
      }
    });
  }

  return text.trim();
}

function mapCategory(oldCategory) {
  const mapping = {
    '시장 분석': '시장분석',
    '트레이딩 전략': '트레이딩',
    '거래 일지': '트레이딩',
    '시장 리스크 분석': '시장분석',
    '기술 분석': '기술분석'
  };

  return mapping[oldCategory] || '일반';
}

// Run migration
migrateMagazines();
