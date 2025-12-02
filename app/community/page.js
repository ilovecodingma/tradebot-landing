'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, [page]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/community/posts?page=${page}&limit=10`);
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.refresh();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">커뮤니티</h1>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {user ? (
                <>
                  <span className="hidden sm:inline text-gray-700 text-sm md:text-base">안녕하세요, {user.name}님</span>
                  <Link
                    href="/community/new"
                    className="flex-1 sm:flex-none text-center btn-primary bg-primary-600 text-white hover:bg-primary-700 px-4 md:px-6 py-2 text-sm"
                  >
                    글쓰기
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 text-sm md:text-base"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 sm:flex-none text-center btn-primary bg-primary-600 text-white hover:bg-primary-700 px-4 md:px-6 py-2 text-sm"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">로딩 중...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 mb-4">아직 게시글이 없습니다.</p>
              {user && (
                <Link
                  href="/community/new"
                  className="inline-block btn-primary bg-primary-600 text-white hover:bg-primary-700 px-6 py-2 text-sm"
                >
                  첫 게시글 작성하기
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/community/${post._id}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 md:p-6"
                >
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs md:text-sm text-gray-500">
                    <span className="font-medium">작성자: {post.authorName}</span>
                    <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                      <span>👁 {post.views || 0}</span>
                      <span>💬 {post.commentCount || post.comments?.length || 0}</span>
                      <span>❤️ {post.likes || 0}</span>
                      <span className="hidden sm:inline">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6 md:mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 md:px-4 py-2 rounded bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                이전
              </button>
              <span className="px-3 md:px-4 py-2 text-sm md:text-base">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 md:px-4 py-2 rounded bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
