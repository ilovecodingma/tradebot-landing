'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary-600">
                TradingBot
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/magazine"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                매거진
              </Link>
              <Link
                href="/community"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                커뮤니티
              </Link>
              <Link
                href="/backtest"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                백테스트
              </Link>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    <span>{user.name}님</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                        <Link
                          href="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          내 프로필
                        </Link>
                        <Link
                          href="/community/new"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          글쓰기
                        </Link>
                        {user?.role === 'admin' && (
                          <>
                            <hr className="my-2" />
                            <Link
                              href="/admin"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2 text-primary-600 hover:bg-gray-100 transition-colors font-medium"
                            >
                              관리자 대시보드
                            </Link>
                          </>
                        )}
                        <hr className="my-2" />
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors"
                        >
                          로그아웃
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary bg-primary-600 text-white hover:bg-primary-700 px-6 py-2 text-sm"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-primary-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Close Button */}
          <div className="flex justify-between items-center p-4 border-b">
            <span className="text-lg font-bold text-gray-900">메뉴</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-700 hover:text-primary-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 py-4">
            {user && (
              <div className="px-6 py-3 border-b border-gray-200 mb-2">
                <p className="text-gray-900 font-medium">{user.name}님</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            )}
            <Link
              href="/magazine"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors"
            >
              매거진
            </Link>
            <Link
              href="/community"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors"
            >
              커뮤니티
            </Link>
            <Link
              href="/backtest"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors"
            >
              백테스트
            </Link>
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors"
                >
                  프로필
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* Bottom CTA */}
          {!user && (
            <div className="p-4 border-t">
              <a
                href="/#cta-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full px-6 py-3 bg-primary-600 text-white hover:bg-primary-700 text-center rounded font-medium transition-colors"
              >
                상담 신청
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
