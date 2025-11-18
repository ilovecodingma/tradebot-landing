import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import postsData from '../data/posts.json';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-96 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <img
          src={post.thumbnail}
          alt={post.title}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 md:px-6 -mt-32 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/magazine')}
          className="mb-6 text-white hover:text-primary-200 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          매거진 목록으로
        </button>

        {/* Article Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Article Header */}
          <div className="p-8 md:p-12 border-b border-gray-200">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full font-medium text-sm">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
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
          <div className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              {post.content.sections.map((section, idx) => (
                <div key={idx} className="mb-12">
                  {/* Section Title */}
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-600">
                    {section.title}
                  </h2>

                  {/* Section Content */}
                  {section.content && (
                    <div className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
                      {section.content}
                    </div>
                  )}

                  {/* Subsections */}
                  {section.subsections && (
                    <div className="space-y-8 ml-4">
                      {section.subsections.map((subsection, subIdx) => (
                        <div key={subIdx} className="border-l-4 border-primary-300 pl-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            {subsection.subtitle}
                          </h3>
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {subsection.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="p-8 md:p-12 bg-gray-50 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">태그</h3>
            <div className="flex flex-wrap gap-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-white text-gray-700 rounded-full font-medium hover:bg-primary-100 hover:text-primary-700 transition-colors cursor-pointer border border-gray-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 mb-20">
          <Link
            to="/magazine"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-lg"
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
