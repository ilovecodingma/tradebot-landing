import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
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
            <button className="text-gray-700 hover:text-primary-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
