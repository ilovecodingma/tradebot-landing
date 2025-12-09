'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const TradingViewChart = dynamic(() => import('@/app/components/TradingViewChart'), {
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">차트 로딩 중...</div>
});

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // 답글 대상 댓글
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    fetchUser();
    fetchPost();
    fetchLikeStatus();
  }, []);

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

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/community/posts/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setPost(data.post);
        setLikes(data.post.likes || 0);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const res = await fetch(`/api/community/posts/${params.id}/like`);
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikes(data.likes);
      }
    } catch (error) {
      console.error('Failed to fetch like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`/api/community/posts/${params.id}/like`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setLiked(data.liked);
        setLikes(data.likes);
      } else {
        alert(data.error || '좋아요 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to like post:', error);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const res = await fetch(`/api/community/posts/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/community');
      } else {
        alert('게시글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!commentContent.trim()) {
      return;
    }

    setSubmittingComment(true);

    try {
      const res = await fetch(`/api/community/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentContent }),
      });

      if (res.ok) {
        setCommentContent('');
        fetchPost();
      } else {
        alert('댓글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    const title = post.title;

    // 카카오톡 공유 (Kakao SDK 사용)
    if (typeof window !== 'undefined' && window.Kakao && window.Kakao.isInitialized()) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: title,
            description: post.content.substring(0, 100) + '...',
            imageUrl: post.images && post.images.length > 0
              ? `${window.location.origin}${post.images[0]}`
              : `${window.location.origin}/og-image.png`,
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
        console.error('Kakao share error:', error);
      }
    }

    // 웹 공유 API 사용 (모바일 브라우저)
    if (navigator.share) {
      navigator.share({
        title: title,
        text: post.content.substring(0, 100) + '...',
        url: url,
      }).catch((err) => console.log('Error sharing:', err));
    } else {
      // 클립보드 복사
      navigator.clipboard.writeText(url).then(() => {
        alert('링크가 클립보드에 복사되었습니다!');
      }).catch(() => {
        // 클립보드 복사 실패시 프롬프트로 표시
        prompt('이 링크를 복사하세요:', url);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">게시글을 찾을 수 없습니다.</p>
          <Link
            href="/community"
            className="text-primary-600 hover:text-primary-700"
          >
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user && user._id === post.authorId.toString();

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 네비게이션 */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-10">
        <div className="container mx-auto px-4">
          <div className="py-3">
            <Link
              href="/community"
              className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              커뮤니티
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* 헤더 영역 */}
          <div className="mb-6">
            {/* 제목 */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* 작성자 & 메타 정보 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {/* 작성자 아바타 */}
                <Link href={`/profile/${post.authorId}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-lg font-bold cursor-pointer hover:shadow-lg transition-shadow">
                    {post.authorName[0]}
                  </div>
                </Link>

                <div>
                  <Link
                    href={`/profile/${post.authorId}`}
                    className="font-semibold text-gray-900 hover:text-primary-600 text-base"
                  >
                    {post.authorName}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatDate(post.createdAt)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {post.views || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center gap-2">
                {isAuthor && (
                  <button
                    onClick={handleDeletePost}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="border-b border-gray-200 pb-8 mb-8">
            {/* TradingView 차트 - 맨 위로 이동 */}
            {post.chartData && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <h3 className="font-bold text-blue-900">
                      📊 {post.chartData.symbol} 차트
                    </h3>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    시간 간격: {post.chartData.interval === 'D' ? '일봉' : post.chartData.interval === 'W' ? '주봉' : post.chartData.interval === 'M' ? '월봉' : `${post.chartData.interval}분`}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                  <TradingViewChart
                    symbol={post.chartData.symbol}
                    interval={post.chartData.interval}
                    height={500}
                  />
                </div>
              </div>
            )}

            {/* 이미지 갤러리 */}
            {post.images && post.images.length > 0 && (
              <div className="mb-6">
                <div className={`${
                  post.images.length === 1 ? 'max-w-3xl mx-auto' : 'grid gap-4 grid-cols-1 md:grid-cols-2'
                }`}>
                  {post.images.map((image, index) => (
                    <div key={index} className="relative group overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(image, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 본문 */}
            <div className="prose prose-lg max-w-none mb-6">
              <div className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">
                {post.content}
              </div>
            </div>

            {/* 인터랙션 버튼 */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={handleLike}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                  liked
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{likes}</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>공유</span>
              </button>

              <div className="flex-1"></div>

              <div className="text-sm text-gray-500">
                댓글 {post.comments?.length || 0}개
              </div>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              댓글 {post.comments?.length || 0}
            </h2>

            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user.name[0]}
                  </div>
                  <div className="flex-1">
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                      rows={3}
                      placeholder="댓글을 남겨보세요..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingComment || !commentContent.trim()}
                        className="px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                      >
                        {submittingComment ? '작성 중...' : '댓글 작성'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg text-center border border-gray-200">
                <p className="text-gray-600 mb-3">댓글을 작성하려면 로그인이 필요합니다.</p>
                <Link
                  href="/login"
                  className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium text-sm transition-colors"
                >
                  로그인하기
                </Link>
              </div>
            )}

            <div className="space-y-6">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="flex items-start gap-3 pb-6 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {comment.authorName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-500 text-sm">
                    첫 댓글을 남겨보세요!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
