'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setRecentPosts(data.recentPosts || []);
        setFormData({
          name: data.user.name || '',
          bio: data.user.bio || ''
        });
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('프로필이 수정되었습니다.');
        setEditing(false);
        fetchProfile();
      } else {
        const data = await res.json();
        alert(data.error || '프로필 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('프로필 수정에 실패했습니다.');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">프로필을 불러올 수 없습니다.</p>
          <Link href="/login" className="text-primary-600 hover:text-primary-700">
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 md:mb-6">
            <Link
              href="/community"
              className="text-primary-600 hover:text-primary-700 text-sm md:text-base"
            >
              ← 커뮤니티로 돌아가기
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-8 mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4 md:mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">내 프로필</h1>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm md:text-base"
                >
                  프로필 수정
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-sm md:text-base"
                  />
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    이메일은 변경할 수 없습니다.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    자기소개
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                    placeholder="자기소개를 입력하세요"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none bg-primary-600 text-white px-4 md:px-6 py-2 rounded-md hover:bg-primary-700 text-sm md:text-base"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: user.name || '',
                        bio: user.bio || ''
                      });
                    }}
                    className="flex-1 sm:flex-none bg-gray-300 text-gray-700 px-4 md:px-6 py-2 rounded-md hover:bg-gray-400 text-sm md:text-base"
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름
                  </label>
                  <p className="text-sm md:text-base text-gray-900">{user.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <p className="text-sm md:text-base text-gray-900">{user.email}</p>
                </div>

                {user.bio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      자기소개
                    </label>
                    <p className="text-sm md:text-base text-gray-900 whitespace-pre-wrap">{user.bio}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가입일
                  </label>
                  <p className="text-sm md:text-base text-gray-900">{formatDate(user.createdAt)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    작성한 게시글 수
                  </label>
                  <p className="text-sm md:text-base text-gray-900">{user.postCount || 0}개</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
              최근 작성한 게시글
            </h2>

            {recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm md:text-base text-gray-600 mb-4">작성한 게시글이 없습니다.</p>
                <Link
                  href="/community/new"
                  className="inline-block bg-primary-600 text-white px-4 md:px-6 py-2 rounded-md hover:bg-primary-700 text-sm md:text-base"
                >
                  첫 게시글 작성하기
                </Link>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {recentPosts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/community/${post._id}`}
                    className="block p-3 md:p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition"
                  >
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 mb-2 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                      <span>👁 {post.views || 0}</span>
                      <span>💬 {post.commentCount || post.comments?.length || 0}</span>
                      <span>❤️ {post.likes || 0}</span>
                      <span className="hidden sm:inline">{formatDate(post.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
