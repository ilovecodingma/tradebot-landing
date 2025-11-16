const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-3">
                🤖 업비트 전략 테스트 봇
              </h3>
              <p className="text-gray-400 mb-4">
                왜 안 샀는지 알려주는 유일한 봇.<br />
              
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com/ilovecodingma/tradebot-landing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-3">빠른 링크</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#demo-section" className="hover:text-white transition-colors">데모 보기</a>
                </li>
                <li>
                  <a href="#cta-section" className="hover:text-white transition-colors">Beta 신청</a>
                </li>
                <li>
                  <a href="https://github.com/ilovecodingma/tradebot-landing" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-3">문의</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:support@example.com" className="hover:text-white transition-colors">
                    📧 support@example.com
                  </a>
                </li>
                <li className="pt-2">
                  <span className="text-xs text-gray-500">1-2일 내 답변</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                © 2025 업비트 전략 테스트 봇. All rights reserved.
              </p>
              <div className="flex gap-6 text-xs">
                <a href="/privacy" className="text-gray-500 hover:text-white transition-colors">
                  개인정보처리방침
                </a>
                <a href="/terms" className="text-gray-500 hover:text-white transition-colors">
                  이용약관
                </a>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-300">⚠️ 투자 유의사항:</strong> 이 소프트웨어는 전략 테스트 목적의 도구입니다.
                암호화폐 거래는 원금 손실 위험이 있으며, 모든 투자 결정은 사용자 본인의 책임입니다.
                과거 성과는 미래 수익을 보장하지 않습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
