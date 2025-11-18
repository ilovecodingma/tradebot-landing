import { Link } from 'react-router-dom';
import { useState } from 'react';
import postsData from '../data/posts.json';

const Magazine = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const categories = ['전체', '시장 분석', '트레이딩 전략', '기술 분석'];

  const filteredPosts = selectedCategory === '전체'
    ? postsData
    : postsData.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30">
              <span className="text-blue-200 text-sm font-medium">암호화폐 전문 리서치</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Trading Insights
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
              데이터 기반 시장 분석과 검증된 트레이딩 전략
            </p>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Category Filter */}
            <div className="mb-12 flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Posts Count */}
            <div className="mb-8 text-center">
              <p className="text-gray-600">
                <span className="font-bold text-blue-600 text-xl">{filteredPosts.length}</span>개의 글
              </p>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
                >
                  <Link to={`/magazine/${post.id}`} className="block md:flex">
                    {/* Thumbnail */}
                    <div className="md:w-96 h-64 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-10 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Meta */}
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold shadow-sm">
                            {post.category}
                          </span>
                          <span className="text-gray-500 font-medium">{post.date}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {post.readTime}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                          {post.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-gray-600 mb-5 leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {post.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Author & Read More */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium">{post.author}</span>
                        </div>
                        <span className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                          자세히 보기
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
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
