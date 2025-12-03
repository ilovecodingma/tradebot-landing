'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchProfileData();
  }, [params.userId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // 사용자 정보 가져오기
      const userRes = await fetch(`/api/users/${params.userId}`);
      if (!userRes.ok) throw new Error('사용자를 찾을 수 없습니다.');
      const userData = await userRes.json();
      setProfileUser(userData.user);

      // 사용자의 게시글 가져오기
      const postsRes = await fetch(`/api/community/posts?authorId=${params.userId}`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);

        // 통계 계산
        const totalLikes = postsData.posts.reduce((sum, post) => sum + (post.likes || 0), 0);
        const totalComments = postsData.posts.reduce((sum, post) => sum + (post.commentCount || 0), 0);

        setStats({
          totalPosts: postsData.posts.length,
          totalComments: totalComments,
          totalLikes: totalLikes,
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const postDate = new Date(date);
    return postDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">사용자를 찾을 수 없습니다.</p>
          <Link href="/community" className="text-primary-600 hover:text-primary-700">
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === params.userId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* 프로필 헤더 */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profileUser.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {profileUser.name}
                  </h1>
                  {profileUser.role === 'admin' && (
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                      관리자
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{profileUser.email}</p>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary-600">{stats.totalPosts}</span>
                    <span className="text-gray-600">게시글</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary-600">{stats.totalComments}</span>
                    <span className="text-gray-600">댓글</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary-600">{stats.totalLikes}</span>
                    <span className="text-gray-600">받은 좋아요</span>
                  </div>
                </div>
              </div>
              {isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  프로필 수정
                </Link>
              )}
            </div>
          </div>

          {/* 작성한 게시글 목록 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                작성한 게시글 ({stats.totalPosts})
              </h2>
            </div>

            {posts.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                아직 작성한 게시글이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/community/${post._id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-primary-600">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>👁 {post.views || 0}</span>
                      <span>💬 {post.commentCount || 0}</span>
                      <span>❤️ {post.likes || 0}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
