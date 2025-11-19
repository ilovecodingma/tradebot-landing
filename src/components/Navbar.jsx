import { Link } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary-600">
                TradingBot
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                홈
              </Link>
              <Link
                to="/magazine"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                매거진
              </Link>
              <a
                href="/#demo-section"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                데모
              </a>
              <a
                href="/#cta-section"
                className="btn-primary bg-primary-600 text-white hover:bg-primary-700 px-6 py-2 text-sm"
              >
                상담 신청
              </a>
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
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors"
            >
              홈
            </Link>
            <Link
              to="/magazine"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors"
            >
              매거진
            </Link>
            <a
              href="/#demo-section"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors"
            >
              데모
            </a>
          </div>

          {/* Bottom CTA */}
          <div className="p-4 border-t">
            <a
              href="/#cta-section"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full px-6 py-3 bg-primary-600 text-white hover:bg-primary-700 text-center rounded font-medium transition-colors"
            >
              상담 신청
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
