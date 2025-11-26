const Installation = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">1:1 맞춤 설치 지원</h2>
            <p className="section-subtitle">
              본인 노트북에 직접 설치 + 실시간 상담
            </p>
          </div>

          {/* Main Value Prop */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-12 border-2 border-primary-300">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">프리미엄 설치 서비스</h3>
              <p className="text-xl text-gray-600">
                본인 노트북에 설치하여 완전한 데이터 소유권 보장<br />
                설치 후 바로 사용 가능한 턴키 솔루션
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              {/* What You Get */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-700">
                  <span className="text-2xl">✅</span>
                  <span>제공 서비스</span>
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span className="text-gray-700">
                      <strong>본인 노트북 설치</strong>: Windows/Mac 모두 지원
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span className="text-gray-700">
                      <strong>실시간 1:1 상담</strong>: 사용법부터 전략 조정까지
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span className="text-gray-700">
                      <strong>업비트 API 연동</strong>: 안전한 키 발급 가이드
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">•</span>
                    <span className="text-gray-700">
                      <strong>대시보드 접속 설정</strong>: 바로 사용 가능한 상태로 인수
                    </span>
                  </li>
                </ul>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-700">
                  <span className="text-2xl">📋</span>
                  <span>진행 방식</span>
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">1.</span>
                    <span className="text-gray-700">
                      이메일 문의 접수 → 1일 내 답변
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">2.</span>
                    <span className="text-gray-700">
                      일정 조율 (평일 저녁/주말 가능)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">3.</span>
                    <span className="text-gray-700">
                      본인 노트북에 직접 설치 (약 30분)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">4.</span>
                    <span className="text-gray-700">
                      사용법 1:1 교육 + 질의응답
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 mb-12">
            <h4 className="text-2xl font-bold mb-6 text-center text-gray-900">
              준비물 (설치 전 확인)
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-bold text-lg mb-3 text-primary-600">하드웨어</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">▪</span>
                    <span className="text-gray-700">
                      <strong>노트북/PC</strong>: Windows 10+ 또는 macOS
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">▪</span>
                    <span className="text-gray-700">
                      <strong>RAM</strong>: 최소 4GB (권장 8GB)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">▪</span>
                    <span className="text-gray-700">
                      <strong>여유 공간</strong>: 2GB 이상
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-lg mb-3 text-primary-600">소프트웨어/계정</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-700">
                      업비트 계정 (API 키 발급 예정)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-700">
                      화상 통화 가능 (Zoom/Discord 등)
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-sm text-gray-700">
                <strong className="text-yellow-700">💡 중요:</strong> 노트북을 24시간 켜두지 않아도 됩니다.
                로컬에서 백테스트 후 만족하시면 추후 서버 세팅을 별도로 진행할 수 있습니다.
              </p>
            </div>
          </div>

          {/* Why Local Install */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">왜 노트북 설치인가?</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-4xl mb-2">🔒</div>
                <div className="font-bold mb-1">100% 프라이버시</div>
                <div className="text-primary-100">
                  API 키가 본인 노트북에만 저장됨<br />
                  외부 서버 노출 걱정 없음
                </div>
              </div>
              <div>
                <div className="text-4xl mb-2">🎯</div>
                <div className="font-bold mb-1">백테스트 먼저</div>
                <div className="text-primary-100">
                  가상 모드로 전략 충분히 검증 후<br />
                  실거래 여부 결정
                </div>
              </div>
              <div>
                <div className="text-4xl mb-2">💰</div>
                <div className="font-bold mb-1">비용 절감</div>
                <div className="text-primary-100">
                  초기엔 서버 비용 없이<br />
                  테스트만 진행 가능
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
            <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span className="text-2xl">💬</span>
              <span>설치 후 지원</span>
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>이메일 지원 (평일 24시간 내 답변)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>주요 업데이트 시 공지 및 가이드 제공</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>추가 1:1 상담 필요 시 별도 일정 조율</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Installation;
