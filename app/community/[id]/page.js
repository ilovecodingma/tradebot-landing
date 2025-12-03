'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
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
    if (typeof window !== 'undefined' && window.Kakao) {
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
    } else {
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
        });
      }
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
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 md:mb-6">
            <Link
              href="/community"
              className="text-primary-600 hover:text-primary-700 text-sm md:text-base"
            >
              ← 커뮤니티로 돌아가기
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-8 mb-4 md:mb-6">
            <div className="mb-4 md:mb-6">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                {post.title}
              </h1>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs md:text-sm text-gray-500">
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                  <span>작성자: {post.authorName}</span>
                  <span className="hidden sm:inline">{formatDate(post.createdAt)}</span>
                  <span>👁 조회 {post.views || 0}</span>
                </div>
                {isAuthor && (
                  <button
                    onClick={handleDeletePost}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>

            <div className="prose max-w-none mb-4 md:mb-6">
              <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* 이미지 갤러리 */}
            {post.images && post.images.length > 0 && (
              <div className="mb-4 md:mb-6">
                <div className={`grid gap-3 ${
                  post.images.length === 1 ? 'grid-cols-1' :
                  post.images.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2 md:grid-cols-3'
                }`}>
                  {post.images.map((image, index) => (
                    <div key={index} className="relative group overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-48 md:h-64 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => window.open(image, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4 md:pt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base ${
                  liked
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg md:text-xl">{liked ? '❤️' : '🤍'}</span>
                <span>좋아요 {likes}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all text-sm md:text-base"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span>공유하기</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              댓글 {post.comments?.length || 0}개
            </h2>

            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <textarea
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                  rows={3}
                  placeholder="댓글을 입력하세요"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !commentContent.trim()}
                    className="bg-primary-600 text-white px-4 md:px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm md:text-base"
                  >
                    {submittingComment ? '작성 중...' : '댓글 작성'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
                <p className="text-sm md:text-base text-gray-600 mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 text-sm md:text-base"
                >
                  로그인하기
                </Link>
              </div>
            )}

            <div className="space-y-4">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="border-t border-gray-200 pt-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-0 mb-2">
                      <span className="font-medium text-sm md:text-base text-gray-900">
                        {comment.authorName}
                      </span>
                      <span className="text-xs md:text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm md:text-base">
                  아직 댓글이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
