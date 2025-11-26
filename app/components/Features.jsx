const Features = () => {
  const features = [
    {
      icon: "📝",
      title: "감사 로그 (Audit Trail)",
      description: "audit_buy_eval, audit_sell_eval, audit_trades 테이블로 모든 매매 판단 기록",
      highlights: ["실패한 조건 JSON 저장", "SQL 쿼리로 분석 가능", "투명성 100%"]
    },
    {
      icon: "🔥",
      title: "Hot Reload (5초 반영)",
      description: "JSON 파일 수정 시 5초 내 전략 즉시 반영. 프로세스 재시작 불필요",
      highlights: ["gon1972_buy_sell_conditions.json", "실시간 파라미터 조정", "다운타임 0초"]
    },
    {
      icon: "🎯",
      title: "업비트 네이티브 지원",
      description: "PyUpbit 기반 한국 거래소 완벽 대응. 원화 마켓 거래 지원",
      highlights: ["KRW-BTC, KRW-ETH 등", "실시간 체결 데이터", "수수료 정확 반영"]
    },
    {
      icon: "🖥️",
      title: "GUI 대시보드 (Streamlit)",
      description: "Python 코딩 없이 웹 브라우저에서 모든 설정 가능. 초보자도 5분 내 시작",
      highlights: ["계정 잔고 실시간 조회", "매매 내역 시각화", "감사 로그 필터링"]
    },
    {
      icon: "🏠",
      title: "All-in-One 개인 서버",
      description: "본인 서버에 직접 설치. 데이터 완전 소유 및 프라이버시 보장",
      highlights: ["클라우드 비용 0원", "API 키 외부 노출 없음", "커스터마이징 자유"]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">핵심 기능 (5가지)</h2>
            <p className="section-subtitle">
              전 세계 어디에도 없는 독자적 기능들
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-primary-400 transition-all duration-300 group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Extra Feature - MACD Strategy */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-300 rounded-xl p-6 hover:shadow-xl transition-all duration-300">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">MACD 전략 (12가지 조건)</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                7개 BUY + 5개 SELL 조건 조합. Take Profit, Stop Loss, Trailing Stop 내장
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">Signal Gate (교차 확인)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">Adaptive EPS (부동소수점 오차 보정)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">Trailing Stop Armed 상태 추적</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tech Stack Badge */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 mb-3">기술 스택</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Python 3.9+', 'PyUpbit', 'SQLite', 'Streamlit', 'Pandas'].map((tech) => (
                <span key={tech} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
