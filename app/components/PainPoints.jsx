const PainPoints = () => {
  const painPoints = [
    {
      icon: "❌",
      title: "\"왜 안 샀는지 모르겠어\"",
      description: "TradingView나 Freqtrade는 체결 기록만 남깁니다. 실패한 조건은 추적 불가능.",
      stat: "백테스트 60% vs 실거래 30%"
    },
    {
      icon: "🔄",
      title: "\"전략 수정할 때마다 재시작\"",
      description: "MACD 파라미터 하나 바꾸려면 프로세스 재시작. 5-10분 딜레이 발생.",
      stat: "1일 평균 3-5회 재시작"
    },
    {
      icon: "🔧",
      title: "\"설정이 너무 복잡해\"",
      description: "Freqtrade는 Python 코딩 필수. QuantConnect는 영어 문서. 진입장벽 높음.",
      stat: "설정 시간 5-7시간"
    },
    {
      icon: "💸",
      title: "\"3Commas 구독료 너무 비싸\"",
      description: "월 $99 Pro Plan. 다중 계정 운용 시 비용 증가. 감사 로그 기능 無.",
      stat: "연간 120만원"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">이런 문제로 고민하고 계신가요?</h2>
            <p className="section-subtitle">
              중급 트레이더들이 가장 많이 겪는 4가지 Pain Points
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {painPoints.map((point, index) => (
              <div
                key={index}
                className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 hover:border-primary-500 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-5xl mb-4">{point.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{point.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{point.description}</p>
                <div className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold text-sm">
                  📊 {point.stat}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Box */}
          <div className="mt-12 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-lg">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              💡 핵심 문제: <span className="text-red-600">투명성 부재</span>
            </p>
            <p className="text-gray-700">
              기존 봇들은 "무엇을 했는지"만 기록합니다. 하지만 정작 필요한 건
              <span className="font-bold text-red-600"> "왜 안 했는지"</span>를 아는 것입니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;
