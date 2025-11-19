import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import postsData from '../data/posts.json';
import { formatContent, formatListItems, formatCodeBlocks } from '../utils/textFormatter';
import TradingChart from '../components/TradingChart';
import suiTradingData from '../data/sui-trading-data.csv?raw';

const MagazinePost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const post = postsData.find((p) => p.id === postId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">글을 찾을 수 없습니다</h1>
          <Link to="/magazine" className="text-primary-600 hover:text-primary-700 font-medium">
            ← 매거진 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Image */}
      <div className="relative h-[500px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        <img
          src={post.thumbnail}
          alt={post.title}
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent"></div>

        {/* Floating Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-5xl mx-auto px-4 md:px-6 -mt-80 relative z-10 pb-20">
        {/* Back Button */}
        <button
          onClick={() => navigate('/magazine')}
          className="mb-8 px-6 py-3 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 rounded-full flex items-center gap-2 border border-white/20 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">매거진 목록으로</span>
        </button>

        {/* Article Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Article Header */}
          <div className="p-10 md:p-16 border-b-2 border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
            {/* Category Badge */}
            <div className="mb-6">
              <span className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold text-sm shadow-lg shadow-blue-500/30">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{post.author}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{post.date}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Excerpt */}
            <p className="text-xl text-gray-700 leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          {/* Article Body */}
          <div className="p-10 md:p-16">
            <div className="prose prose-lg max-w-none">
              {post.content.sections.map((section, idx) => (
                <div key={idx} className="mb-16">
                  {/* Section Title */}
                  <div className="mb-8">
                    <div className="inline-block px-1 mb-3">
                      <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                  </div>

                  {/* Section Content */}
                  {section.content && (
                    <div
                      className="text-lg text-gray-700 leading-relaxed mb-8 bg-gradient-to-r from-blue-50/30 to-white p-8 rounded-xl border-l-4 border-blue-500 shadow-sm"
                      dangerouslySetInnerHTML={{ __html: formatCodeBlocks(formatListItems(section.content)) }}
                    />
                  )}

                  {/* Subsections */}
                  {section.subsections && (
                    <div className="space-y-6">
                      {section.subsections.map((subsection, subIdx) => (
                        <div key={subIdx} className="bg-gradient-to-br from-white to-gray-50/50 p-8 rounded-2xl border-l-4 border-blue-400 shadow-md hover:shadow-xl transition-all duration-300 hover:border-blue-600">
                          <h3 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl text-sm font-bold shadow-lg">
                              {subIdx + 1}
                            </span>
                            <span className="flex-1">{subsection.subtitle}</span>
                          </h3>
                          <div
                            className="text-gray-700 leading-relaxed text-lg pl-13"
                            dangerouslySetInnerHTML={{ __html: formatCodeBlocks(formatListItems(subsection.content)) }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Trading Charts - Only for SUI Trading Log */}
            {postId === 'sui-trading-log-2024-11-19' && (
              <div className="mt-16 pt-16 border-t-2 border-gray-200">
                <div className="mb-12">
                  <div className="inline-block px-1 mb-3">
                    <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                    실시간 트레이딩 데이터 분석
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    2025-11-19 KRW-SUI 거래 내역을 MACD 지표와 함께 시각화한 차트입니다.
                  </p>
                </div>
                <TradingChart data={suiTradingData} title="KRW-SUI 3분봉 트레이딩 분석" />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="p-10 md:p-16 bg-gradient-to-b from-gray-50 to-white border-t-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              관련 태그
            </h3>
            <div className="flex flex-wrap gap-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-5 py-2.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-blue-50 hover:text-blue-700 hover:shadow-md transition-all cursor-pointer border-2 border-gray-200 hover:border-blue-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-16 text-center">
          <Link
            to="/magazine"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            모든 글 보기
          </Link>
        </div>
      </article>
    </div>
  );
};

export default MagazinePost;
