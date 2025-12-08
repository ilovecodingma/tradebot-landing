'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const TradingViewChart = dynamic(() => import('@/app/components/TradingViewChart'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100">차트 로딩 중...</div>
});

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
      const res = await fetch(`/api/community/posts?page=${page}&limit=10&category=${categoryTab}`);
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

  const [activeTab, setActiveTab] = useState('all');
  const [categoryTab, setCategoryTab] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, [categoryTab]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">커뮤니티</h1>

            {/* Category Tabs */}
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => { setCategoryTab('all'); setPage(1); }}
                  className={`px-5 py-2.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                    categoryTab === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => { setCategoryTab('general'); setPage(1); }}
                  className={`px-5 py-2.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                    categoryTab === 'general'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  일반글
                </button>
                <button
                  onClick={() => { setCategoryTab('trading'); setPage(1); }}
                  className={`px-5 py-2.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                    categoryTab === 'trading'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  트레이딩 아이디어
                </button>
              </div>
            </div>

            {/* Tabs & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  최신순
                </button>
                <button
                  onClick={() => setActiveTab('popular')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'popular'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  인기순
                </button>
              </div>

              <div className="flex items-center gap-3">
                {user && (
                  <Link
                    href="/community/new"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    아이디어 공유
                  </Link>
                )}
                {!user && (
                  <Link
                    href="/login"
                    className="px-6 py-2.5 bg-white text-gray-700 rounded-md hover:bg-gray-50 font-medium border border-gray-300"
                  >
                    로그인
                  </Link>
                )}
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/community/${post._id}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
                    {post.images && post.images.length > 0 ? (
                      // 이미지가 있으면 이미지 표시
                      <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : post.chartData ? (
                      // 이미지가 없고 차트가 있으면 차트 표시
                      <div className="w-full h-full">
                        <TradingViewChart
                          symbol={post.chartData.symbol}
                          interval={post.chartData.interval}
                          height={192}
                          theme="light"
                        />
                      </div>
                    ) : (
                      // 이미지도 차트도 없으면 기본 아이콘
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                    )}
                    {isNew(post.createdAt) && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded shadow-lg">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {post.title}
                      {(post.commentCount || post.comments?.length || 0) > 0 && (
                        <span className="ml-2 text-primary-600 text-sm">
                          [{post.commentCount || post.comments?.length || 0}]
                        </span>
                      )}
                      {post.chartData && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          📊 차트
                        </span>
                      )}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {post.content}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {post.authorName[0]}
                      </div>
                      <span className="text-sm text-gray-700 font-medium hover:text-primary-600">
                        {post.authorName}
                      </span>
                    </div>

                    {/* Stats & Date */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {post.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post.likes || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(post.createdAt)}
                      </span>
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
