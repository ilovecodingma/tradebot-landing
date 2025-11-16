const Demo = () => {
  return (
    <section id="demo-section" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">데모 스크린샷</h2>
            <p className="text-lg md:text-xl text-gray-300 mb-12">
              실제 UI와 감사 로그 시스템 미리보기
            </p>
          </div>

          {/* Screenshot Placeholders */}
          <div className="space-y-12">
            {/* Dashboard */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                대시보드 (Streamlit UI)
              </h3>
              <div className="bg-gray-700 rounded-xl p-8 border-2 border-gray-600">
                <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-900/50 p-4 rounded border border-green-700">
                      <div className="text-green-400 text-xs mb-1">💰 가상 KRW</div>
                      <div className="text-2xl font-bold">1,234,567원</div>
                    </div>
                    <div className="bg-blue-900/50 p-4 rounded border border-blue-700">
                      <div className="text-blue-400 text-xs mb-1">🪙 보유 코인</div>
                      <div className="text-2xl font-bold">0.0234 BTC</div>
                    </div>
                    <div className="bg-purple-900/50 p-4 rounded border border-purple-700">
                      <div className="text-purple-400 text-xs mb-1">📊 누적 수익</div>
                      <div className="text-2xl font-bold text-green-400">+234,567원</div>
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs">
                    🕒 현재 시각: 2025-01-16 14:32:11 | 엔진 상태: <span className="text-green-400">● RUNNING</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  ✅ 실시간 계정 잔고 / 포지션 / 매매 내역을 웹에서 확인
                </p>
              </div>
            </div>

            {/* Audit Buy Eval */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                감사 로그 - BUY 평가 (왜 못 샀는지)
              </h3>
              <div className="bg-gray-700 rounded-xl p-8 border-2 border-gray-600">
                <div className="bg-gray-800 rounded-lg p-6 font-mono text-xs overflow-x-auto">
                  <div className="text-green-400 mb-2">SELECT * FROM audit_buy_eval WHERE overall_ok = 0 LIMIT 3;</div>
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-600">
                      <tr>
                        <th className="py-2 text-gray-400">timestamp</th>
                        <th className="py-2 text-gray-400">ticker</th>
                        <th className="py-2 text-gray-400">price</th>
                        <th className="py-2 text-gray-400">overall_ok</th>
                        <th className="py-2 text-gray-400">failed_keys</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      <tr className="border-b border-gray-700">
                        <td className="py-2">2025-01-16 14:30:05</td>
                        <td className="py-2">KRW-BTC</td>
                        <td className="py-2">55000000</td>
                        <td className="py-2 text-red-400">0</td>
                        <td className="py-2 text-yellow-400">["signal_confirm"]</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-2">2025-01-16 14:25:12</td>
                        <td className="py-2">KRW-ETH</td>
                        <td className="py-2">3200000</td>
                        <td className="py-2 text-red-400">0</td>
                        <td className="py-2 text-yellow-400">["have_position"]</td>
                      </tr>
                      <tr>
                        <td className="py-2">2025-01-16 14:20:33</td>
                        <td className="py-2">KRW-XRP</td>
                        <td className="py-2">1500</td>
                        <td className="py-2 text-red-400">0</td>
                        <td className="py-2 text-yellow-400">["macd_positive"]</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  ✅ 실패한 조건(failed_keys)이 JSON으로 저장 → 전략 개선에 즉시 활용
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <button
              onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-12 py-6 text-xl"
            >
              🚀 지금 설치 문의하기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
