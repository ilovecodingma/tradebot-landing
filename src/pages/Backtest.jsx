import { useState, useEffect, useMemo, useCallback } from 'react';
import { getOHLCV, getMarkets, INTERVALS } from '../utils/upbitApi';
import { runBacktest } from '../utils/backtesting';
import BacktestChart from '../components/BacktestChart';

export default function Backtest() {
  // 데이터 상태
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('KRW-BTC');
  const [selectedInterval, setSelectedInterval] = useState('5분');
  const [dataCount, setDataCount] = useState(500);
  const [ohlcvData, setOhlcvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 백테스트 결과
  const [backtestResult, setBacktestResult] = useState(null);

  // 전략 파라미터
  const [strategy, setStrategy] = useState({
    initialCash: 10000000,
    commission: 0.0005,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    macdThreshold: 0,
    takeProfit: 0.03,
    stopLoss: 0.01,
    trailingStop: 0.1,
    minHoldingPeriod: 5,
    // 매수 조건
    goldenCrossEnabled: true,
    macdPositiveEnabled: false,
    signalPositiveEnabled: false,
    bullishCandleEnabled: false,
    macdTrendingUpEnabled: false,
    aboveMA20Enabled: false,
    aboveMA60Enabled: false,
    // 매도 조건
    trailingStopEnabled: true,
    takeProfitEnabled: true,
    stopLossEnabled: true,
    macdNegativeEnabled: false,
    deadCrossEnabled: false,
  });

  // 마켓 목록 로드
  useEffect(() => {
    async function loadMarkets() {
      try {
        const data = await getMarkets('KRW');
        setMarkets(data);
      } catch (err) {
        console.error('Failed to load markets:', err);
      }
    }
    loadMarkets();
  }, []);

  // 백테스트 실행 (데이터 자동 로드 포함)
  const handleRunBacktest = useCallback(async () => {
    setLoading(true);
    setError(null);
    setBacktestResult(null);

    try {
      // 데이터가 없거나 설정이 변경된 경우 자동으로 데이터 로드
      const data = await getOHLCV(selectedMarket, selectedInterval, dataCount);
      setOhlcvData(data);

      // 약간의 지연으로 UI 업데이트 허용
      setTimeout(() => {
        try {
          const result = runBacktest(data, strategy);
          setBacktestResult(result);
          setError(null);
        } catch (err) {
          setError('백테스트 실행 중 오류: ' + err.message);
        } finally {
          setLoading(false);
        }
      }, 100);
    } catch (err) {
      setError('데이터 로드 중 오류: ' + err.message);
      setLoading(false);
    }
  }, [selectedMarket, selectedInterval, dataCount, strategy]);

  // 전략 파라미터 업데이트 (메모이제이션)
  const updateStrategy = useCallback((key, value) => {
    setStrategy(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          백테스팅 시뮬레이터
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 설정 패널 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 데이터 설정 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-purple-500">
              <h2 className="text-2xl font-semibold mb-4 text-purple-300">데이터 설정</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">마켓</label>
                  <select
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    {markets.map(m => (
                      <option key={m.market} value={m.market}>
                        {m.korean_name} ({m.market})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">인터벌</label>
                  <select
                    value={selectedInterval}
                    onChange={(e) => setSelectedInterval(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    {Object.keys(INTERVALS).map(key => (
                      <option key={key} value={key}>{INTERVALS[key].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">데이터 개수: {dataCount}</label>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={dataCount}
                    onChange={(e) => setDataCount(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* MACD 파라미터 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-purple-500">
              <h2 className="text-2xl font-semibold mb-4 text-purple-300">MACD 파라미터</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Fast Period: {strategy.fastPeriod}</label>
                  <input type="range" min="5" max="50" value={strategy.fastPeriod}
                    onChange={(e) => updateStrategy('fastPeriod', Number(e.target.value))}
                    className="w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Slow Period: {strategy.slowPeriod}</label>
                  <input type="range" min="10" max="100" value={strategy.slowPeriod}
                    onChange={(e) => updateStrategy('slowPeriod', Number(e.target.value))}
                    className="w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Signal Period: {strategy.signalPeriod}</label>
                  <input type="range" min="5" max="30" value={strategy.signalPeriod}
                    onChange={(e) => updateStrategy('signalPeriod', Number(e.target.value))}
                    className="w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">MACD Threshold: {strategy.macdThreshold}</label>
                  <input type="range" min="-0.1" max="0.1" step="0.001" value={strategy.macdThreshold}
                    onChange={(e) => updateStrategy('macdThreshold', Number(e.target.value))}
                    className="w-full" />
                </div>
              </div>
            </div>

            {/* 리스크 관리 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-purple-500">
              <h2 className="text-2xl font-semibold mb-4 text-purple-300">리스크 관리</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">초기 자금: {(strategy.initialCash / 1000000).toFixed(1)}M</label>
                  <input type="range" min="1000000" max="100000000" step="1000000" value={strategy.initialCash}
                    onChange={(e) => updateStrategy('initialCash', Number(e.target.value))}
                    className="w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">수수료: {(strategy.commission * 100).toFixed(2)}%</label>
                  <input type="range" min="0" max="0.01" step="0.0001" value={strategy.commission}
                    onChange={(e) => updateStrategy('commission', Number(e.target.value))}
                    className="w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">익절: {(strategy.takeProfit * 100).toFixed(1)}%</label>
                  <input type="range" min="0.01" max="0.2" step="0.01" value={strategy.takeProfit}
                    onChange={(e) => updateStrategy('takeProfit', Number(e.target.value))}
                    className="w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">손절: {(strategy.stopLoss * 100).toFixed(1)}%</label>
                  <input type="range" min="0.01" max="0.2" step="0.01" value={strategy.stopLoss}
                    onChange={(e) => updateStrategy('stopLoss', Number(e.target.value))}
                    className="w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">트레일링: {(strategy.trailingStop * 100).toFixed(1)}%</label>
                  <input type="range" min="0.01" max="0.3" step="0.01" value={strategy.trailingStop}
                    onChange={(e) => updateStrategy('trailingStop', Number(e.target.value))}
                    className="w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">최소 보유: {strategy.minHoldingPeriod}봉</label>
                  <input type="range" min="0" max="50" value={strategy.minHoldingPeriod}
                    onChange={(e) => updateStrategy('minHoldingPeriod', Number(e.target.value))}
                    className="w-full" />
                </div>
              </div>
            </div>

            {/* 매수 조건 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-green-500">
              <h2 className="text-2xl font-semibold mb-4 text-green-300">매수 조건</h2>

              <div className="space-y-2">
                {[
                  { key: 'goldenCrossEnabled', label: '골든 크로스' },
                  { key: 'macdPositiveEnabled', label: 'MACD 양수 돌파' },
                  { key: 'signalPositiveEnabled', label: 'Signal 양수 돌파' },
                  { key: 'bullishCandleEnabled', label: '양봉' },
                  { key: 'macdTrendingUpEnabled', label: 'MACD 상승 추세' },
                  { key: 'aboveMA20Enabled', label: 'MA20 위' },
                  { key: 'aboveMA60Enabled', label: 'MA60 위' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={strategy[key]}
                      onChange={(e) => updateStrategy(key, e.target.checked)}
                      className="w-4 h-4 accent-green-500"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 매도 조건 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-red-500">
              <h2 className="text-2xl font-semibold mb-4 text-red-300">매도 조건</h2>

              <div className="space-y-2">
                {[
                  { key: 'trailingStopEnabled', label: '트레일링 스탑' },
                  { key: 'takeProfitEnabled', label: '익절' },
                  { key: 'stopLossEnabled', label: '손절' },
                  { key: 'macdNegativeEnabled', label: 'MACD 음수 돌파' },
                  { key: 'deadCrossEnabled', label: '데드 크로스' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={strategy[key]}
                      onChange={(e) => updateStrategy(key, e.target.checked)}
                      className="w-4 h-4 accent-red-500"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 백테스트 실행 버튼 */}
            <button
              onClick={handleRunBacktest}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg"
            >
              {loading ? '⏳ 데이터 수집 및 분석 중...' : '🚀 백테스트 실행'}
            </button>
          </div>

          {/* 우측: 결과 및 차트 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 에러 표시 */}
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
                <p className="text-red-200">❌ {error}</p>
              </div>
            )}

            {/* 백테스트 결과 */}
            {backtestResult && (
              <>
                {/* 주요 지표 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-4 border border-purple-500">
                    <p className="text-sm text-gray-400">총 수익률</p>
                    <p className={`text-2xl font-bold ${backtestResult.stats.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {backtestResult.stats.totalReturn.toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-4 border border-purple-500">
                    <p className="text-sm text-gray-400">거래 횟수</p>
                    <p className="text-2xl font-bold">{backtestResult.stats.totalTrades}</p>
                  </div>
                  <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-4 border border-purple-500">
                    <p className="text-sm text-gray-400">승률</p>
                    <p className="text-2xl font-bold text-purple-400">{backtestResult.stats.winRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-4 border border-purple-500">
                    <p className="text-sm text-gray-400">최대 낙폭</p>
                    <p className="text-2xl font-bold text-red-400">-{backtestResult.stats.maxDrawdown.toFixed(2)}%</p>
                  </div>
                </div>

                {/* 상세 통계 */}
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-purple-500">
                  <h3 className="text-xl font-semibold mb-4">상세 통계</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">초기 자금</p>
                      <p className="font-semibold">{backtestResult.stats.initialCash.toLocaleString()} KRW</p>
                    </div>
                    <div>
                      <p className="text-gray-400">최종 자산</p>
                      <p className="font-semibold">{backtestResult.stats.finalEquity.toLocaleString()} KRW</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Buy & Hold 수익률</p>
                      <p className="font-semibold">{backtestResult.stats.buyHoldReturn.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">평균 수익률</p>
                      <p className="font-semibold">{backtestResult.stats.avgTrade.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">최대 수익 거래</p>
                      <p className="font-semibold text-green-400">{backtestResult.stats.maxTrade.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">최대 손실 거래</p>
                      <p className="font-semibold text-red-400">{backtestResult.stats.minTrade.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">승리 거래</p>
                      <p className="font-semibold text-green-400">{backtestResult.stats.winningTrades}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">손실 거래</p>
                      <p className="font-semibold text-red-400">{backtestResult.stats.losingTrades}</p>
                    </div>
                  </div>
                </div>

                {/* 차트 */}
                <BacktestChart
                  data={ohlcvData}
                  result={backtestResult}
                  strategy={strategy}
                />

                {/* 거래 내역 */}
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-purple-500">
                  <h3 className="text-xl font-semibold mb-4">거래 내역 (최근 20개)</h3>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-800">
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2">타입</th>
                          <th className="text-left py-2">사유</th>
                          <th className="text-right py-2">가격</th>
                          <th className="text-right py-2">수량</th>
                          <th className="text-right py-2">수익</th>
                          <th className="text-left py-2">시간</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backtestResult.trades.slice(-20).reverse().map((trade, idx) => (
                          <tr key={`${trade.index}-${idx}`} className="border-b border-gray-700">
                            <td className={`py-2 ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.type}
                            </td>
                            <td className="py-2 text-gray-300">{trade.reason}</td>
                            <td className="text-right py-2">{trade.price.toLocaleString()}</td>
                            <td className="text-right py-2">{trade.quantity.toFixed(6)}</td>
                            <td className={`text-right py-2 ${trade.profitPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.profitPct !== undefined ? `${trade.profitPct.toFixed(2)}%` : '-'}
                            </td>
                            <td className="py-2 text-gray-400 text-xs">
                              {new Date(trade.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* 초기 상태 */}
            {!backtestResult && !error && (
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-12 border border-purple-500 text-center">
                <p className="text-gray-400 text-lg">왼쪽에서 설정을 조정하고 백테스트를 실행하세요</p>
                <p className="text-gray-500 text-sm mt-2">백테스트 실행 시 자동으로 데이터를 수집합니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
