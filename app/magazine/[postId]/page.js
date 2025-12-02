'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const MagazinePost = ({ params }) => {
  const router = useRouter();
  const [magazine, setMagazine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const postId = params?.postId;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUser();
    if (postId) {
      fetchMagazine();
      fetchComments();
      checkLikeStatus();
    }
  }, [postId]);

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

  const fetchMagazine = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/magazine/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setMagazine(data.magazine);
        setLikeCount(data.magazine.likes || 0);
      }
    } catch (error) {
      console.error('Failed to fetch magazine:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/magazine/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const res = await fetch(`/api/magazine/${postId}/like`);
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
      }
    } catch (error) {
      console.error('Failed to check like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`/api/magazine/${postId}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.likes);
      } else {
        const data = await res.json();
        alert(data.error || '좋아요 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to like:', error);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/magazine/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        setNewComment('');
        fetchComments();
      } else {
        const data = await res.json();
        alert(data.error || '댓글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const res = await fetch(`/api/magazine/${postId}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchComments();
      } else {
        const data = await res.json();
        alert(data.error || '댓글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: magazine?.title,
        text: magazine?.excerpt,
        url: url,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('링크가 복사되었습니다!');
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!magazine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">글을 찾을 수 없습니다</h1>
          <Link href="/magazine" className="text-primary-600 hover:text-primary-700 font-medium">
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
          onClick={() => router.push('/magazine')}
          className="mb-8 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>목록으로</span>
        </button>

        {/* Article Header */}
        <header className="mb-12">
          {/* Cover Image */}
          {magazine.coverImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={magazine.coverImage}
                alt={magazine.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {magazine.title}
          </h1>

          {/* Meta Information */}
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
            <span>{magazine.authorName || '관리자'}</span>
            <span>·</span>
            <span>{formatDate(magazine.createdAt)}</span>
            <span>·</span>
            <span>조회 {magazine.views || 0}</span>
          </div>

          {/* Category Badge */}
          <div className="mb-8">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
              {magazine.category}
            </span>
          </div>

          {/* Excerpt */}
          {magazine.excerpt && (
            <p className="text-lg text-gray-600 leading-relaxed italic border-l-4 border-gray-200 pl-4">
              {magazine.excerpt}
            </p>
          )}
        </header>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none mb-12">
          <div
            className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: magazine.content.replace(/\n/g, '<br />') }}
          />
        </div>

        {/* Like and Share Buttons */}
        <div className="flex items-center gap-4 py-8 border-y border-gray-200 mb-12">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              liked
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likeCount}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>공유</span>
          </button>
        </div>

        {/* Tags */}
        {magazine.tags && magazine.tags.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-wrap gap-2">
              {magazine.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            댓글 {comments.length}
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "댓글을 작성하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
              disabled={!user || submitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!user || submitting || !newComment.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '작성 중...' : '댓글 작성'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">첫 댓글을 작성해보세요!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900">{comment.authorName}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    {(user?._id === comment.authorId.toString() || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Link
            href="/magazine"
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
