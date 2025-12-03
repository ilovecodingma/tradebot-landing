'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function IdeaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [idea, setIdea] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchIdea();
  }, [params.id]);

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

  const fetchIdea = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ideas/${params.id}`);
      if (!res.ok) {
        router.push('/ideas');
        return;
      }
      const data = await res.json();
      setIdea(data.idea);

      // Check if user has liked this idea
      if (user && data.idea.likedBy?.includes(user._id)) {
        setLiked(true);
      }
    } catch (error) {
      console.error('Failed to fetch idea:', error);
      router.push('/ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`/api/ideas/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' })
      });

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setIdea({
          ...idea,
          likes: data.liked ? idea.likes + 1 : idea.likes - 1,
          likedBy: data.liked
            ? [...(idea.likedBy || []), user._id]
            : (idea.likedBy || []).filter(id => id !== user._id)
        });
      }
    } catch (error) {
      console.error('Failed to like idea:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/ideas/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comment', comment })
      });

      if (res.ok) {
        const data = await res.json();
        setIdea({
          ...idea,
          comments: [...(idea.comments || []), data.comment]
        });
        setComment('');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${idea.title} - ${idea.symbol} ${idea.position === 'long' ? '롱' : '숏'} 포지션`;

    // Try KakaoTalk
    if (typeof window !== 'undefined' && window.Kakao) {
      try {
        if (!window.Kakao.isInitialized()) {
          const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_KEY || '8e4c743e2e4f4b4c8f0e9c9d8e7f6a5b';
          window.Kakao.init(kakaoKey);
        }

        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: idea.title,
            description: idea.description,
            imageUrl: idea.chartImage || 'https://via.placeholder.com/800x400',
            link: {
              mobileWebUrl: url,
              webUrl: url,
            },
          },
          buttons: [
            {
              title: '자세히 보기',
              link: {
                mobileWebUrl: url,
                webUrl: url,
              },
            },
          ],
        });
        return;
      } catch (error) {
        console.log('KakaoTalk share failed:', error);
      }
    }

    // Fallback to Web Share API
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
        return;
      } catch (error) {
        console.log('Web Share failed:', error);
      }
    }

    // Final fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      alert('링크가 클립보드에 복사되었습니다!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/ideas"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              트레이딩 아이디어
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            {/* Symbol & Position Badge */}
            <div className="flex items-center gap-3 mb-3">
              {idea.symbol && (
                <span className="text-xl font-bold text-gray-900 uppercase">
                  {idea.symbol}
                </span>
              )}
              {idea.timeframe && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{idea.timeframe}</span>
                </>
              )}
              {idea.position && (
                <span className={`px-3 py-1 text-sm font-bold rounded ${
                  idea.position === 'long'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {idea.position === 'long' ? '롱 포지션' : '숏 포지션'}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {idea.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href={`/profile/${idea.authorId}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {idea.authorName[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{idea.authorName}</div>
                    <div className="text-sm text-gray-500">{formatDate(idea.createdAt)}</div>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    liked
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{idea.likes || 0}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  공유
                </button>
              </div>
            </div>
          </div>

          {/* Chart Image */}
          {idea.chartImage && (
            <div className="mb-8 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={idea.chartImage}
                alt={idea.title}
                className="w-full"
              />
            </div>
          )}

          {/* Price Targets */}
          {(idea.entryPrice || idea.targetPrice || idea.stopLoss) && (
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">가격 목표</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {idea.entryPrice && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">진입가</div>
                    <div className="text-xl font-bold text-gray-900">{idea.entryPrice}</div>
                  </div>
                )}
                {idea.targetPrice && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">목표가</div>
                    <div className={`text-xl font-bold ${idea.position === 'long' ? 'text-green-600' : 'text-red-600'}`}>
                      {idea.targetPrice}
                    </div>
                  </div>
                )}
                {idea.stopLoss && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">손절가</div>
                    <div className="text-xl font-bold text-red-600">{idea.stopLoss}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">아이디어 요약</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {idea.description}
            </p>
          </div>

          {/* Detailed Analysis */}
          {idea.analysis && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">상세 분석</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {idea.analysis}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 py-6 border-t border-b border-gray-200 mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm">{idea.views || 0} 조회</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">{idea.likes || 0} 좋아요</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">{idea.comments?.length || 0} 댓글</span>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              댓글 {idea.comments?.length || 0}
            </h2>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user.username[0]}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="댓글을 입력하세요..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={submittingComment || !comment.trim()}
                        className="px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingComment ? '작성 중...' : '댓글 작성'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-3">댓글을 작성하려면 로그인이 필요합니다.</p>
                <Link
                  href="/login"
                  className="inline-block px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium transition-colors"
                >
                  로그인
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {idea.comments?.map((comment) => (
                <div key={comment._id} className="flex gap-3 bg-gray-50 rounded-lg p-4">
                  <Link
                    href={`/profile/${comment.authorId}`}
                    className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    {comment.authorName[0]}
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/profile/${comment.authorId}`}
                        className="font-semibold text-gray-900 hover:text-primary-600"
                      >
                        {comment.authorName}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}

              {(!idea.comments || idea.comments.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
