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
    const now = new Date();
    const postDate = new Date(date);
    const diff = now - postDate;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (hours < 48) return '어제';

    return postDate.toLocaleDateString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
    });
  };

  const isNew = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = now - postDate;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours < 24;
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
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">제목</th>
                      <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 w-28">작성자</th>
                      <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 w-20">조회</th>
                      <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 w-20">댓글</th>
                      <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 w-20">추천</th>
                      <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 w-24">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post, index) => (
                      <tr
                        key={post._id}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/community/${post._id}`}
                            className="flex items-center gap-2 group"
                          >
                            <span className="text-base text-gray-900 group-hover:text-primary-600 group-hover:underline font-medium">
                              {post.title}
                            </span>
                            {isNew(post.createdAt) && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
                                NEW
                              </span>
                            )}
                            {(post.commentCount || post.comments?.length || 0) > 0 && (
                              <span className="text-primary-600 text-sm font-medium">
                                [{post.commentCount || post.comments?.length || 0}]
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Link
                            href={`/profile/${post.authorId}`}
                            className="text-sm text-gray-700 hover:text-primary-600 hover:underline font-medium"
                          >
                            {post.authorName}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-gray-600">
                          {post.views || 0}
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-gray-600">
                          {post.commentCount || post.comments?.length || 0}
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-gray-600">
                          {post.likes || 0}
                        </td>
                        <td className="px-4 py-4 text-center text-xs text-gray-500">
                          {formatDate(post.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                  >
                    <Link href={`/community/${post._id}`}>
                      <div className="flex items-start gap-2 mb-2">
                        <h2 className="text-base font-bold text-gray-900 flex-1 hover:text-primary-600">
                          {post.title}
                        </h2>
                        {isNew(post.createdAt) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white shrink-0">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {post.content}
                      </p>
                    </Link>
                    <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <Link
                        href={`/profile/${post.authorId}`}
                        className="font-medium hover:text-primary-600"
                      >
                        {post.authorName}
                      </Link>
                      <div className="flex items-center gap-3">
                        <span>👁 {post.views || 0}</span>
                        <span>💬 {post.commentCount || post.comments?.length || 0}</span>
                        <span>❤️ {post.likes || 0}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </>
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
