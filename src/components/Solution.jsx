const Solution = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">해결책: 완전 투명한 감사 로그 시스템</h2>
            <p className="section-subtitle">
              모든 매매 판단 과정을 SQL로 조회 가능
            </p>
          </div>

          {/* Main Solution Visual */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Problem */}
              <div>
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-4">
                  <h4 className="font-bold text-red-700 mb-3 text-lg">❌ 기존 봇들</h4>
                  <div className="space-y-2 text-sm font-mono bg-red-100 p-4 rounded">
                    <div>2025-01-16 14:32:11 - <span className="text-green-600">BUY</span> KRW-BTC 55000000</div>
                    <div>2025-01-16 15:45:22 - <span className="text-red-600">SELL</span> KRW-BTC 54800000</div>
                    <div className="text-gray-400">...</div>
                    <div className="text-red-600 font-bold mt-2">⚠️ 실패한 조건은 기록 안 됨</div>
                  </div>
                </div>
              </div>

              {/* Right: Solution */}
              <div>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <h4 className="font-bold text-green-700 mb-3 text-lg">✅ 우리 봇</h4>
                  <div className="space-y-2 text-sm font-mono bg-green-100 p-4 rounded">
                    <div className="text-gray-700">SELECT * FROM audit_buy_eval</div>
                    <div className="text-gray-700">WHERE overall_ok = 0;</div>
                    <div className="mt-3 text-xs">
                      <div className="bg-white p-2 rounded mb-1">
                        <span className="text-blue-600">failed_keys</span>: ["signal_confirm"]
                      </div>
                      <div className="bg-white p-2 rounded">
                        <span className="text-blue-600">checks</span>: {`{"macd": 0.023, "signal": 0.028}`}
                      </div>
                    </div>
                    <div className="text-green-600 font-bold mt-2">✅ 모든 조건 추적 가능</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h4 className="font-bold text-lg mb-2">실패 원인 추적</h4>
              <p className="text-gray-600 text-sm">
                audit_buy_eval 테이블에<br />
                failed_keys JSON 저장
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold text-lg mb-2">5초 Hot Reload</h4>
              <p className="text-gray-600 text-sm">
                JSON 파일 수정하면<br />
                즉시 반영 (재시작 不要)
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-bold text-lg mb-2">투자자 보고</h4>
              <p className="text-gray-600 text-sm">
                매매 근거 완전 공개<br />
                (펀드 운용 시 필수)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
