import { Link } from 'react-router-dom';
import postsData from '../data/posts.json';

const Magazine = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
              Trading Magazine
            </h1>
            <p className="text-xl md:text-2xl text-primary-100">
              암호화폐 시장 분석과 트레이딩 인사이트
            </p>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Category Filter */}
            <div className="mb-8 flex flex-wrap gap-3">
              <button className="px-6 py-2 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors">
                전체
              </button>
              <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors">
                시장 분석
              </button>
              <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors">
                트레이딩 전략
              </button>
              <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors">
                기술 분석
              </button>
            </div>

            {/* Posts List */}
            <div className="space-y-8">
              {postsData.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <Link to={`/magazine/${post.id}`} className="block md:flex">
                    {/* Thumbnail */}
                    <div className="md:w-80 h-64 md:h-auto bg-gray-200 flex-shrink-0">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 flex-1">
                      {/* Meta */}
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                          {post.category}
                        </span>
                        <span>{post.date}</span>
                        <span>·</span>
                        <span>{post.readTime} 읽기</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-sm text-gray-500 hover:text-primary-600 cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Author & Read More */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          작성자: <span className="font-medium">{post.author}</span>
                        </div>
                        <span className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                          자세히 보기 →
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Empty State (if no posts) */}
            {postsData.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">아직 발행된 글이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Magazine;
