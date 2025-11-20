import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import postsData from '../data/posts.json';
import { formatContent, formatListItems, formatCodeBlocks } from '../utils/textFormatter';
import TradingChart from '../components/TradingChart';
import CommunitySentimentChart from '../components/CommunitySentimentChart';
import TradingSentimentChart from '../components/TradingSentimentChart';
import suiTradingData from '../data/sui-trading-data.csv?raw';
import communitySentimentData from '../data/community-sentiment-data.csv?raw';
import tradingSentiment from '../data/trading-sentiment.csv?raw';
import coinTradingSentiment from '../data/coin-trading-sentiment.csv?raw';

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
    <div className="min-h-screen bg-white">
      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
        {/* Back Button */}
        <button
          onClick={() => navigate('/magazine')}
          className="mb-8 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>목록으로</span>
        </button>

        {/* Article Header */}
        <header className="mb-12">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
            <span>{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>

          {/* Category Badge */}
          <div className="mb-8">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
              {post.category}
            </span>
          </div>

          {/* Excerpt */}
          <p className="text-lg text-gray-600 leading-relaxed italic border-l-4 border-gray-200 pl-4">
            {post.excerpt}
          </p>
        </header>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none">
          {post.content.sections.map((section, idx) => (
            <div key={idx} className="mb-12">
              {/* Section Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-12">
                {section.title}
              </h2>

              {/* Section Content */}
              {section.content && (
                <div
                  className="text-lg text-gray-700 leading-relaxed mb-8"
                  dangerouslySetInnerHTML={{ __html: formatCodeBlocks(formatListItems(section.content)) }}
                />
              )}

              {/* Subsections */}
              {section.subsections && (
                <div className="space-y-8">
                  {section.subsections.map((subsection, subIdx) => (
                    <div key={subIdx}>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {subsection.subtitle}
                      </h3>
                      <div
                        className="text-gray-700 leading-relaxed"
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
          <div className="mt-16 pt-16 border-t border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              실시간 트레이딩 데이터 분석
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              2025-11-19 KRW-SUI 거래 내역을 MACD 지표와 함께 시각화한 차트입니다.
            </p>
            <TradingChart data={suiTradingData} title="KRW-SUI 3분봉 트레이딩 분석" />
          </div>
        )}

        {/* Community Sentiment Charts - Only for Community Sentiment Analysis */}
        {postId === 'community-sentiment-analysis-2025' && (
          <div className="mt-16 pt-16 border-t border-gray-200 space-y-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                커뮤니티 데이터 시각화
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                DCInside 비트코인 갤러리의 4,899개 게시글을 분석한 결과입니다.
              </p>
            </div>

            {/* 언급 빈도 차트 */}
            <CommunitySentimentChart data={communitySentimentData} title="코인별 커뮤니티 언급 빈도" />

            {/* 매매 의견 파이 차트 */}
            <TradingSentimentChart
              overallData={tradingSentiment}
              coinData={coinTradingSentiment}
              title="커뮤니티 매매 심리 분석"
            />
          </div>
        )}

        {/* Tags */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Link
            to="/magazine"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
