'use client';

import { useState, useEffect, useRef } from 'react';
import { streamCandles } from '../utils/upbitWebSocket';
import { LiveBacktestEngine } from '../utils/liveBacktesting';
import { getOHLCV, getMarkets, INTERVALS } from '../utils/upbitApi';

export default function LiveTradingPage() {
  // 전략 설정
  const [strategy, setStrategy] = useState({
    useV2Logic: true,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 7,
    takeProfit: 0.05,
    stopLoss: 0.01,
    macdCrossoverThreshold: 0.0,
    aboveMA20Enabled: false,
    aboveMA60Enabled: false,
    fee: 0.0005,
  });

  // 마켓 설정
  const [selectedMarket, setSelectedMarket] = useState('KRW-BTC');
  const [selectedInterval, setSelectedInterval] = useState('5분');
  const [initialCash, setInitialCash] = useState(10000000);

  // 상태
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('대기 중');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [position, setPosition] = useState(0);
  const [cash, setCash] = useState(initialCash);
  const [equity, setEquity] = useState(initialCash);
  const [positionStatus, setPositionStatus] = useState(null);

  // 통계
  const [stats, setStats] = useState({
    totalTrades: 0,
    winTrades: 0,
    loseTrades: 0,
    winRate: 0,
    totalReturn: 0,
    maxDrawdown: 0,
  });

  // 거래 내역
  const [trades, setTrades] = useState([]);
  const [logs, setLogs] = useState([]);

  // 마켓 목록
  const [markets, setMarkets] = useState([]);

  // Refs
  const engineRef = useRef(null);
  const wsClientRef = useRef(null);

  // 마켓 목록 로드
  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      const marketList = await getMarkets('KRW');
      setMarkets(marketList);
    } catch (error) {
      addLog('마켓 목록 로드 실패: ' + error.message, 'error');
    }
  };

  // 로그 추가
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    setLogs(prev => [{
      timestamp,
      message,
      type,
      id: Date.now(),
    }, ...prev].slice(0, 100)); // 최대 100개
  };

  // 실시간 트레이딩 시작
  const startLiveTrading = async () => {
    setIsLoading(true);
    setStatus('초기화 중...');
    addLog('실시간 트레이딩 시작 준비 중...', 'info');

    try {
      // 1. 과거 데이터 로드
      addLog(`${selectedMarket} ${selectedInterval} 과거 데이터 로드 중...`, 'info');
      const historicalData = await getOHLCV(selectedMarket, selectedInterval, 200);

      if (!historicalData || historicalData.length === 0) {
        throw new Error('과거 데이터를 불러올 수 없습니다');
      }

      addLog(`과거 데이터 ${historicalData.length}개 로드 완료`, 'success');

      // 2. 백테스팅 엔진 초기화
      const engine = new LiveBacktestEngine(strategy, initialCash);
      engineRef.current = engine;

      // 3. 과거 데이터로 초기화
      historicalData.forEach(candle => {
        engine.addCandle(candle);
      });

      addLog('백테스팅 엔진 초기화 완료', 'success');

      // 4. 이벤트 리스너 등록
      engine.on('update', (data) => {
        setCurrentPrice(data.candle.close);
        setPosition(data.position);
        setCash(data.cash);
        setEquity(data.equity);
        setPositionStatus(data.positionStatus);
        setStats(data.stats);
      });

      engine.on('trade', (trade) => {
        setTrades(prev => [trade, ...prev].slice(0, 50));

        const typeKor = trade.type === 'BUY' ? '매수' : '매도';
        const reason = trade.reason || '';
        let message = `${typeKor} @ ${trade.price.toLocaleString()}원`;

        if (trade.type === 'SELL') {
          message += ` | 수익: ${trade.profit.toLocaleString()}원 (${trade.profitRate.toFixed(2)}%)`;
        }

        addLog(message, trade.type === 'BUY' ? 'buy' : 'sell');
      });

      // 5. WebSocket 연결
      addLog('실시간 데이터 스트리밍 시작...', 'info');

      const wsClient = streamCandles(
        selectedMarket,
        selectedInterval,
        (candle) => {
          // 새 캔들 추가
          engine.addCandle(candle);
        },
        (error) => {
          addLog('WebSocket 에러: ' + error.message, 'error');
        }
      );

      wsClientRef.current = wsClient;

      // 연결 상태 모니터링
      wsClient.on('status', (status) => {
        if (status === 'connected') {
          setStatus('실행 중');
          addLog('실시간 스트리밍 연결 완료', 'success');
        } else if (status === 'disconnected') {
          setStatus('연결 끊김');
          addLog('스트리밍 연결 끊김', 'warning');
        } else if (status === 'error') {
          setStatus('오류 발생');
          addLog('스트리밍 오류 발생', 'error');
        }
      });

      setIsRunning(true);
      setIsLoading(false);

    } catch (error) {
      console.error('실시간 트레이딩 시작 실패:', error);
      addLog('실시간 트레이딩 시작 실패: ' + error.message, 'error');
      setStatus('오류 발생');
      setIsLoading(false);
    }
  };

  // 실시간 트레이딩 중지
  const stopLiveTrading = () => {
    if (wsClientRef.current) {
      wsClientRef.current.disconnect();
      wsClientRef.current = null;
    }

    setIsRunning(false);
    setStatus('중지됨');
    addLog('실시간 트레이딩 중지', 'warning');
  };

  // 초기화
  const resetAll = () => {
    stopLiveTrading();

    if (engineRef.current) {
      engineRef.current.reset();
    }

    setPosition(0);
    setCash(initialCash);
    setEquity(initialCash);
    setPositionStatus(null);
    setStats({
      totalTrades: 0,
      winTrades: 0,
      loseTrades: 0,
      winRate: 0,
      totalReturn: 0,
      maxDrawdown: 0,
    });
    setTrades([]);
    setLogs([]);
    setStatus('대기 중');

    addLog('모든 데이터 초기화 완료', 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">실시간 트레이딩</h1>
          <p className="text-gray-400">
            Python Trading-Bot V1과 동일한 실시간 백테스팅 시스템
          </p>
        </div>

        {/* 상태 표시 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-4 border border-purple-500">
            <div className="text-sm text-gray-400 mb-1">상태</div>
            <div className={`text-xl font-bold ${
              status === '실행 중' ? 'text-green-400' :
              status === '오류 발생' ? 'text-red-400' :
              status === '중지됨' ? 'text-yellow-400' :
              'text-gray-400'
            }`}>
              {status}
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-4 border border-purple-500">
            <div className="text-sm text-gray-400 mb-1">현재 가격</div>
            <div className="text-xl font-bold text-blue-400">
              {currentPrice > 0 ? `${currentPrice.toLocaleString()}원` : '-'}
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-4 border border-purple-500">
            <div className="text-sm text-gray-400 mb-1">포지션</div>
            <div className="text-xl font-bold text-purple-400">
              {position > 0 ? `${position.toFixed(8)} (${positionStatus || ''})` : '없음'}
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-4 border border-purple-500">
            <div className="text-sm text-gray-400 mb-1">총 자산</div>
            <div className={`text-xl font-bold ${
              equity >= initialCash ? 'text-green-400' : 'text-red-400'
            }`}>
              {equity.toLocaleString()}원
            </div>
            <div className="text-xs text-gray-400 mt-1">
              현금: {cash.toLocaleString()}원
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-800 bg-opacity-30 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">수익률</div>
            <div className={`text-lg font-bold ${
              stats.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {stats.totalReturn?.toFixed(2) || 0}%
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-30 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">총 거래</div>
            <div className="text-lg font-bold text-white">
              {stats.totalTrades || 0}회
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-30 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">승률</div>
            <div className="text-lg font-bold text-blue-400">
              {stats.winRate?.toFixed(1) || 0}%
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-30 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">승리</div>
            <div className="text-lg font-bold text-green-400">
              {stats.winTrades || 0}
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-30 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">패배</div>
            <div className="text-lg font-bold text-red-400">
              {stats.loseTrades || 0}
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-30 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">MDD</div>
            <div className="text-lg font-bold text-orange-400">
              {stats.maxDrawdown?.toFixed(2) || 0}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 설정 패널 */}
          <div className="space-y-6">
            {/* 마켓 설정 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-blue-500">
              <h2 className="text-xl font-semibold mb-4 text-blue-300">마켓 설정</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">마켓</label>
                  <select
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    disabled={isRunning}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {markets.map(m => (
                      <option key={m.market} value={m.market}>
                        {m.korean_name} ({m.market})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">시간봉</label>
                  <select
                    value={selectedInterval}
                    onChange={(e) => setSelectedInterval(e.target.value)}
                    disabled={isRunning}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {Object.keys(INTERVALS).map(interval => (
                      <option key={interval} value={interval}>{interval}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">초기 자산</label>
                  <input
                    type="number"
                    value={initialCash}
                    onChange={(e) => setInitialCash(Number(e.target.value))}
                    disabled={isRunning}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* 전략 설정 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-purple-500">
              <h2 className="text-xl font-semibold mb-4 text-purple-300">전략 설정</h2>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={strategy.useV2Logic}
                      onChange={(e) => setStrategy({...strategy, useV2Logic: e.target.checked})}
                      disabled={isRunning}
                      className="form-checkbox"
                    />
                    <span className="text-sm">V2 전략 사용 (Python 동일)</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Fast Period</label>
                    <input
                      type="number"
                      value={strategy.fastPeriod}
                      onChange={(e) => setStrategy({...strategy, fastPeriod: Number(e.target.value)})}
                      disabled={isRunning}
                      className="w-full px-2 py-1 text-sm bg-gray-700 rounded border border-gray-600 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Slow Period</label>
                    <input
                      type="number"
                      value={strategy.slowPeriod}
                      onChange={(e) => setStrategy({...strategy, slowPeriod: Number(e.target.value)})}
                      disabled={isRunning}
                      className="w-full px-2 py-1 text-sm bg-gray-700 rounded border border-gray-600 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Signal Period</label>
                    <input
                      type="number"
                      value={strategy.signalPeriod}
                      onChange={(e) => setStrategy({...strategy, signalPeriod: Number(e.target.value)})}
                      disabled={isRunning}
                      className="w-full px-2 py-1 text-sm bg-gray-700 rounded border border-gray-600 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Threshold</label>
                    <input
                      type="number"
                      step="0.1"
                      value={strategy.macdCrossoverThreshold}
                      onChange={(e) => setStrategy({...strategy, macdCrossoverThreshold: Number(e.target.value)})}
                      disabled={isRunning}
                      className="w-full px-2 py-1 text-sm bg-gray-700 rounded border border-gray-600 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">익절 (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={strategy.takeProfit * 100}
                      onChange={(e) => setStrategy({...strategy, takeProfit: Number(e.target.value) / 100})}
                      disabled={isRunning}
                      className="w-full px-2 py-1 text-sm bg-gray-700 rounded border border-gray-600 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">손절 (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={strategy.stopLoss * 100}
                      onChange={(e) => setStrategy({...strategy, stopLoss: Number(e.target.value) / 100})}
                      disabled={isRunning}
                      className="w-full px-2 py-1 text-sm bg-gray-700 rounded border border-gray-600 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={strategy.aboveMA20Enabled}
                      onChange={(e) => setStrategy({...strategy, aboveMA20Enabled: e.target.checked})}
                      disabled={isRunning}
                      className="form-checkbox"
                    />
                    <span className="text-sm">MA20 이상에서만 매수</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={strategy.aboveMA60Enabled}
                      onChange={(e) => setStrategy({...strategy, aboveMA60Enabled: e.target.checked})}
                      disabled={isRunning}
                      className="form-checkbox"
                    />
                    <span className="text-sm">MA60 이상에서만 매수</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 컨트롤 버튼 */}
            <div className="space-y-3">
              {!isRunning ? (
                <button
                  onClick={startLiveTrading}
                  disabled={isLoading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  {isLoading ? '초기화 중...' : '시작'}
                </button>
              ) : (
                <button
                  onClick={stopLiveTrading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                >
                  중지
                </button>
              )}

              <button
                onClick={resetAll}
                disabled={isRunning}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 rounded-lg font-semibold transition-colors"
              >
                초기화
              </button>
            </div>
          </div>

          {/* 오른쪽: 거래 내역 & 로그 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 거래 내역 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-green-500">
              <h2 className="text-xl font-semibold mb-4 text-green-300">거래 내역</h2>

              <div className="overflow-auto max-h-80">
                {trades.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">거래 내역이 없습니다</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-gray-400 border-b border-gray-700 sticky top-0 bg-gray-800">
                      <tr>
                        <th className="text-left py-2 px-2">시간</th>
                        <th className="text-left py-2 px-2">타입</th>
                        <th className="text-right py-2 px-2">가격</th>
                        <th className="text-right py-2 px-2">수량</th>
                        <th className="text-right py-2 px-2">수익</th>
                        <th className="text-left py-2 px-2">이유</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((trade) => (
                        <tr key={trade.timestamp + trade.type} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="py-2 px-2 text-xs">
                            {new Date(trade.timestamp).toLocaleTimeString('ko-KR')}
                          </td>
                          <td className={`py-2 px-2 font-bold ${
                            trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {trade.type === 'BUY' ? '매수' : '매도'}
                          </td>
                          <td className="py-2 px-2 text-right">
                            {trade.price.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right text-xs">
                            {trade.amount.toFixed(8)}
                          </td>
                          <td className={`py-2 px-2 text-right ${
                            trade.profit > 0 ? 'text-green-400' :
                            trade.profit < 0 ? 'text-red-400' :
                            'text-gray-400'
                          }`}>
                            {trade.profit ? `${trade.profit.toLocaleString()} (${trade.profitRate.toFixed(2)}%)` : '-'}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-400">
                            {trade.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* 로그 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-yellow-500">
              <h2 className="text-xl font-semibold mb-4 text-yellow-300">시스템 로그</h2>

              <div className="overflow-auto max-h-96 font-mono text-xs space-y-1">
                {logs.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">로그가 없습니다</p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded ${
                        log.type === 'error' ? 'bg-red-900 bg-opacity-30 text-red-300' :
                        log.type === 'warning' ? 'bg-yellow-900 bg-opacity-30 text-yellow-300' :
                        log.type === 'success' ? 'bg-green-900 bg-opacity-30 text-green-300' :
                        log.type === 'buy' ? 'bg-blue-900 bg-opacity-30 text-blue-300' :
                        log.type === 'sell' ? 'bg-purple-900 bg-opacity-30 text-purple-300' :
                        'bg-gray-700 bg-opacity-30 text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
