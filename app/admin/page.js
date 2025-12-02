'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'admin') {
          alert('관리자만 접근할 수 있습니다.');
          router.push('/');
          return;
        }
        setUser(data.user);
        fetchMagazines();
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to check admin:', error);
      router.push('/');
    }
  };

  const fetchMagazines = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/magazine?limit=100');
      const data = await res.json();
      setMagazines(data.magazines || []);
    } catch (error) {
      console.error('Failed to fetch magazines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말로 이 매거진을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const res = await fetch(`/api/magazine/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('매거진이 삭제되었습니다.');
        fetchMagazines();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete magazine:', error);
      alert('삭제에 실패했습니다.');
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

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">매거진 관리</p>
            </div>
            <Link
              href="/admin/magazine/new"
              className="w-full sm:w-auto text-center bg-primary-600 text-white px-4 md:px-6 py-2 rounded-md hover:bg-primary-700 text-sm md:text-base"
            >
              새 매거진 작성
            </Link>
          </div>

          {magazines.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center">
              <p className="text-gray-600 mb-4">아직 매거진이 없습니다.</p>
              <Link
                href="/admin/magazine/new"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                첫 매거진 작성하기
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제목
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        카테고리
                      </th>
                      <th className="hidden sm:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        조회수
                      </th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        좋아요
                      </th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작성일
                      </th>
                      <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {magazines.map((magazine) => (
                      <tr key={magazine._id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {magazine.title}
                          </div>
                          <div className="text-xs text-gray-500 md:hidden mt-1">
                            {magazine.category} • 조회 {magazine.views || 0}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {magazine.category}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {magazine.views || 0}
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {magazine.likes || 0}
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(magazine.createdAt)}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/magazine/edit/${magazine._id}`}
                            className="text-primary-600 hover:text-primary-900 mr-2 md:mr-4"
                          >
                            수정
                          </Link>
                          <button
                            onClick={() => handleDelete(magazine._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
