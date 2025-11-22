const Hero = () => {
  const scrollToCTA = () => {
    document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-transparent text-white py-20 md:py-32 overflow-hidden">

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 leading-tight px-4">
            백테스트 승률 60%인데<br />
            실거래는 30%?
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl font-medium mb-3 md:mb-4 text-primary-100 px-4">
            왜 안 샀는지 알려주는 <span className="text-yellow-300 font-bold">유일한</span> 봇
          </p>

          <p className="text-base sm:text-lg md:text-xl mb-8 md:mb-10 text-primary-50 max-w-2xl mx-auto px-4">
            업비트 전용 | 노트북 설치 | 1:1 프리미엄 상담
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <button
              onClick={scrollToCTA}
              className="w-full sm:w-auto btn-primary bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl shadow-2xl"
            >
              💬 상담 신청하기
            </button>
            <button
              onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-6 py-3 bg-white/20 text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-primary-600 transition-all duration-200"
            >
              📺 데모 보기
            </button>
          </div>

          {/* Stats */}
          <div className="mt-12 md:mt-16 grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-4 max-w-2xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300">5초</div>
              <div className="text-xs sm:text-sm md:text-base text-primary-100 mt-1">전략 반영 속도</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300">100%</div>
              <div className="text-xs sm:text-sm md:text-base text-primary-100 mt-1">감사 로그 투명성</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300">30명</div>
              <div className="text-xs sm:text-sm md:text-base text-primary-100 mt-1">평생 무료 혜택</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
