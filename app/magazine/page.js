'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function MagazinePage() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['전체', '트레이딩', '기술분석', '시장분석', '투자전략', '일반'];

  useEffect(() => {
    fetchMagazines();
  }, []);

  const fetchMagazines = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/magazine?limit=100');
      if (res.ok) {
        const data = await res.json();
        setMagazines(data.magazines || []);
      }
    } catch (error) {
      console.error('Failed to fetch magazines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMagazines = selectedCategory === '전체'
    ? magazines
    : magazines.filter(magazine => magazine.category === selectedCategory);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-gray-200 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              Trading Insights
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              데이터 기반 시장 분석과 검증된 트레이딩 전략
            </p>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            {/* Category Filter */}
            <div className="mb-12 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-20">
                <div className="text-gray-600">로딩 중...</div>
              </div>
            ) : (
              <>
                {/* Posts List */}
                <div className="space-y-12">
                  {filteredMagazines.map((magazine) => (
                    <article
                      key={magazine._id}
                      className="group border-b border-gray-200 pb-12 last:border-0"
                    >
                      <Link href={`/magazine/${magazine._id}`} className="block">
                        {/* Cover Image */}
                        {magazine.coverImage && (
                          <div className="mb-4 rounded-lg overflow-hidden">
                            <img
                              src={magazine.coverImage}
                              alt={magazine.title}
                              className="w-full h-48 md:h-64 object-cover group-hover:opacity-90 transition-opacity"
                            />
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                          <span>{magazine.authorName || '관리자'}</span>
                          <span>·</span>
                          <span>{formatDate(magazine.createdAt)}</span>
                          <span>·</span>
                          <span>조회 {magazine.views || 0}</span>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-gray-600 transition-colors">
                          {magazine.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-base text-gray-600 mb-4 leading-relaxed line-clamp-2">
                          {magazine.excerpt}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {magazine.category}
                            </span>
                            {magazine.tags?.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs text-gray-500"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {magazine.likes || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {magazine.commentCount || 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>

                {/* Empty State (if no posts) */}
                {filteredMagazines.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                    <div className="max-w-md mx-auto">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">해당 카테고리에 글이 없습니다</h3>
                      <p className="text-gray-500">다른 카테고리를 선택해보세요</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
