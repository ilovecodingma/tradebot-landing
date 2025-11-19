import { Link } from 'react-router-dom';
import { useState } from 'react';
import postsData from '../data/posts.json';

const Magazine = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const categories = ['전체', '시장 분석', '트레이딩 전략', '거래 일지', '시장 리스크 분석', '기술 분석'];

  const filteredPosts = selectedCategory === '전체'
    ? postsData
    : postsData.filter(post => post.category === selectedCategory);

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

            {/* Posts List */}
            <div className="space-y-12">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group border-b border-gray-200 pb-12 last:border-0"
                >
                  <Link to={`/magazine/${post.id}`} className="block">
                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                      <span>{post.author}</span>
                      <span>·</span>
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-gray-600 transition-colors">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-base text-gray-600 mb-4 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {post.category}
                        </span>
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-gray-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Empty State (if no posts) */}
            {filteredPosts.length === 0 && (
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Magazine;
