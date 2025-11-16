const Comparison = () => {
  const features = [
    { name: "감사 로그 (실패 추적)", ours: true, freqtrade: false, tradingview: false, threeCommas: false },
    { name: "Hot Reload (5초 반영)", ours: true, freqtrade: false, tradingview: false, threeCommas: false },
    { name: "업비트 네이티브 지원", ours: true, freqtrade: "부분", tradingview: false, threeCommas: true },
    { name: "한국어 UI", ours: true, freqtrade: false, tradingview: "부분", threeCommas: false },
    { name: "GUI 대시보드", ours: true, freqtrade: false, tradingview: true, threeCommas: true },
    { name: "개인 서버 배포", ours: true, freqtrade: true, tradingview: false, threeCommas: false },
    { name: "무료 설치 지원", ours: true, freqtrade: false, tradingview: false, threeCommas: false }
  ];

  const renderCell = (value) => {
    if (value === true) return <span className="text-2xl">✅</span>;
    if (value === false) return <span className="text-2xl">❌</span>;
    return <span className="text-sm font-semibold text-gray-700">{value}</span>;
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">경쟁사 대비 차별점</h2>
            <p className="section-subtitle">
              Freqtrade, TradingView, 3Commas와 비교
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-xl shadow-2xl border-2 border-gray-200">
            <table className="w-full bg-white">
              <thead>
                <tr className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                  <th className="py-4 px-6 text-left font-bold">기능</th>
                  <th className="py-4 px-6 text-center font-bold bg-yellow-400 text-gray-900">
                    🚀 우리 봇<br />
                    <span className="text-xs font-normal">(Beta)</span>
                  </th>
                  <th className="py-4 px-6 text-center font-bold">Freqtrade</th>
                  <th className="py-4 px-6 text-center font-bold">TradingView</th>
                  <th className="py-4 px-6 text-center font-bold">3Commas</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <td className="py-4 px-6 font-semibold text-gray-900">{feature.name}</td>
                    <td className="py-4 px-6 text-center bg-yellow-50 font-bold">
                      {renderCell(feature.ours)}
                    </td>
                    <td className="py-4 px-6 text-center">{renderCell(feature.freqtrade)}</td>
                    <td className="py-4 px-6 text-center">{renderCell(feature.tradingview)}</td>
                    <td className="py-4 px-6 text-center">{renderCell(feature.threeCommas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Differentiators */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
              <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span>독자적 강점</span>
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">1.</span>
                  <span className="text-gray-700">
                    <strong>감사 로그</strong>: audit_buy_eval/sell_eval로 실패 원인 100% 추적
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">2.</span>
                  <span className="text-gray-700">
                    <strong>Hot Reload</strong>: JSON 파일 수정 시 5초 내 반영 (재시작 不要)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">3.</span>
                  <span className="text-gray-700">
                    <strong>한국 시장 특화</strong>: 업비트 네이티브 + 한국어 UI + KRW 마켓
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
              <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                <span>타겟 시나리오</span>
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span className="text-gray-700">
                    <strong>Freqtrade 너무 어렵다면</strong> → GUI + 한국어로 5분 내 시작
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span className="text-gray-700">
                    <strong>3Commas 비싸다면</strong> → 라이선스 무료 (본인 서버 운영)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span className="text-gray-700">
                    <strong>TradingView 괴리 심하다면</strong> → 감사 로그로 실패 원인 파악
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footnote */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              * 설치 및 지원은 무료. 서버 운영비는 본인 부담 (로컬 PC 사용 시 0원)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
