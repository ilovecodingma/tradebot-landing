'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchUser();
    fetchIdeas();
  }, [page, activeTab]);

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

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ideas?page=${page}&limit=12&filter=${activeTab}`);
      const data = await res.json();
      setIdeas(data.ideas || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">트레이딩 아이디어</h1>
            <p className="text-gray-600">전문 트레이더들의 차트 분석과 전략을 공유하세요</p>
          </div>

          {/* Tabs & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setActiveTab('long')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'long'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                롱 포지션
              </button>
              <button
                onClick={() => setActiveTab('short')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'short'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                숏 포지션
              </button>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <Link
                  href="/ideas/new"
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

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">로딩 중...</div>
            </div>
          ) : ideas.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-600 mb-4">아직 공유된 아이디어가 없습니다.</p>
              {user && (
                <Link
                  href="/ideas/new"
                  className="inline-block btn-primary bg-primary-600 text-white hover:bg-primary-700 px-6 py-2 text-sm"
                >
                  첫 아이디어 공유하기
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ideas.map((idea) => (
                <Link
                  key={idea._id}
                  href={`/ideas/${idea._id}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Chart Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {idea.chartImage ? (
                      <img
                        src={idea.chartImage}
                        alt={idea.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                    )}
                    {isNew(idea.createdAt) && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded shadow-lg">
                        NEW
                      </span>
                    )}
                    {/* Position Badge */}
                    {idea.position && (
                      <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded shadow-lg ${
                        idea.position === 'long'
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {idea.position === 'long' ? '롱' : '숏'}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Symbol */}
                    {idea.symbol && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase">{idea.symbol}</span>
                        {idea.timeframe && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{idea.timeframe}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {idea.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {idea.description}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {idea.authorName[0]}
                      </div>
                      <span className="text-sm text-gray-700 font-medium hover:text-primary-600">
                        {idea.authorName}
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
                          {idea.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {idea.likes || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(idea.createdAt)}
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
