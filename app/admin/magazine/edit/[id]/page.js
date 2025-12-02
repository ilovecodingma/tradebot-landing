'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditMagazinePage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: '트레이딩',
    tags: '',
    published: true
  });

  useEffect(() => {
    checkAdmin();
    fetchMagazine();
  }, []);

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'admin') {
          alert('관리자만 접근할 수 있습니다.');
          router.push('/');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to check admin:', error);
      router.push('/');
    }
  };

  const fetchMagazine = async () => {
    try {
      setFetching(true);
      const id = params?.id;
      const res = await fetch(`/api/magazine/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          title: data.magazine.title,
          content: data.magazine.content,
          excerpt: data.magazine.excerpt || '',
          coverImage: data.magazine.coverImage || '',
          category: data.magazine.category,
          tags: data.magazine.tags?.join(', ') || '',
          published: data.magazine.published
        });
      } else {
        alert('매거진을 찾을 수 없습니다.');
        router.push('/admin');
      }
    } catch (error) {
      console.error('Failed to fetch magazine:', error);
      alert('매거진을 불러올 수 없습니다.');
      router.push('/admin');
    } finally {
      setFetching(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, coverImage: data.url }));
        alert('이미지가 업로드되었습니다.');
      } else {
        alert('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const id = params?.id;
      const res = await fetch(`/api/magazine/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
      });

      if (res.ok) {
        alert('매거진이 수정되었습니다.');
        router.push('/admin');
      } else {
        const data = await res.json();
        alert(data.error || '수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 md:mb-6">
            <Link
              href="/admin"
              className="text-primary-600 hover:text-primary-700 text-sm md:text-base"
            >
              ← 대시보드로 돌아가기
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
              매거진 수정
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                  placeholder="매거진 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                >
                  <option value="트레이딩">트레이딩</option>
                  <option value="기술분석">기술분석</option>
                  <option value="시장분석">시장분석</option>
                  <option value="투자전략">투자전략</option>
                  <option value="일반">일반</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  커버 이미지
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                />
                {uploading && <p className="text-sm text-gray-500 mt-2">업로드 중...</p>}
                {formData.coverImage && (
                  <img
                    src={formData.coverImage}
                    alt="Cover"
                    className="mt-4 max-w-full h-auto rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                  placeholder="매거진 내용을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요약 (선택사항)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                  placeholder="매거진 요약을 입력하세요 (비워두면 자동 생성)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
                  placeholder="예: 비트코인, 주식, 투자"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                  게시
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-primary-600 text-white px-4 md:px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm md:text-base"
                >
                  {loading ? '수정 중...' : '수정 완료'}
                </button>
                <Link
                  href="/admin"
                  className="flex-1 sm:flex-none text-center bg-gray-300 text-gray-700 px-4 md:px-6 py-2 rounded-md hover:bg-gray-400 text-sm md:text-base"
                >
                  취소
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
