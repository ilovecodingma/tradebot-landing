/**
 * MACD 백테스팅 유틸리티
 * 다양한 전략을 커스터마이징할 수 있는 백테스팅 엔진
 */

// EMA 계산 (Python pandas ewm과 동일)
export function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  const ema = new Array(data.length);

  // 첫 번째 유효한 값부터 SMA로 시작
  let sum = 0;
  let count = 0;
  for (let i = 0; i < Math.min(period, data.length); i++) {
    if (data[i] !== undefined && !isNaN(data[i])) {
      sum += data[i];
      count++;
    }
  }

  if (count > 0) {
    ema[period - 1] = sum / count;
  }

  // EMA 계산
  for (let i = period; i < data.length; i++) {
    if (data[i] !== undefined && !isNaN(data[i]) && ema[i - 1] !== undefined) {
      ema[i] = data[i] * k + ema[i - 1] * (1 - k);
    }
  }

  return ema;
}

// MACD 계산 (Python 버전과 완전히 동일)
export function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  // Fast EMA와 Slow EMA 계산
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  // MACD Line 계산
  const macd = new Array(prices.length);
  for (let i = 0; i < prices.length; i++) {
    if (fastEMA[i] !== undefined && slowEMA[i] !== undefined) {
      macd[i] = fastEMA[i] - slowEMA[i];
    }
  }

  // Signal Line 계산 (MACD의 EMA)
  const signal = calculateEMA(macd, signalPeriod);

  // Histogram 계산
  const histogram = new Array(prices.length);
  for (let i = 0; i < prices.length; i++) {
    if (macd[i] !== undefined && signal[i] !== undefined) {
      histogram[i] = macd[i] - signal[i];
    }
  }

  return { macd, signal, histogram };
}

// 이동평균 계산
export function calculateMA(prices, period) {
  const ma = [];
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += prices[i - j];
    }
    ma[i] = sum / period;
  }
  return ma;
}

// 골든 크로스 감지
function isGoldenCross(macd, signal, index) {
  if (index < 1) return false;
  if (macd[index] === undefined || signal[index] === undefined) return false;
  if (macd[index - 1] === undefined || signal[index - 1] === undefined) return false;
  const prevDelta = macd[index - 1] - signal[index - 1];
  const currDelta = macd[index] - signal[index];
  return prevDelta <= 0 && currDelta > 0;
}

// 데드 크로스 감지
function isDeadCross(macd, signal, index) {
  if (index < 1) return false;
  if (macd[index] === undefined || signal[index] === undefined) return false;
  if (macd[index - 1] === undefined || signal[index - 1] === undefined) return false;
  const prevDelta = macd[index - 1] - signal[index - 1];
  const currDelta = macd[index] - signal[index];
  return prevDelta >= 0 && currDelta < 0;
}

/**
 * trading-bot-v1의 MACDStrategy를 JavaScript로 구현
 * Python backtesting.py 라이브러리 로직과 동일하게 동작
 */
export function runBacktestV2(data, strategy) {
  const {
    initialCash = 10000000,
    commission = 0.0005,
    fastPeriod = 12,
    slowPeriod = 26,
    signalPeriod = 7, // Python 버전은 7
    macdThreshold = 0,
    takeProfit = 0.05, // Python 버전은 5%
    stopLoss = 0.01,   // Python 버전은 1%
    minHoldingPeriod = 1,
    macdCrossoverThreshold = 0.0,
  } = strategy;

  const prices = data.map(d => d.close);
  const { macd, signal } = calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod);

  let cash = initialCash;
  let position = 0; // 코인 수량
  let entryPrice = null;
  let entryBar = null;
  let lastSignalBar = null;

  const trades = [];
  const equity = [];
  const signalEvents = []; // LOG 이벤트 저장

  for (let i = Math.max(slowPeriod, signalPeriod); i < data.length; i++) {
    const currentBar = i;
    const currentPrice = prices[i];
    const macdVal = macd[i];
    const signalVal = signal[i];

    if (macdVal === undefined || signalVal === undefined) continue;

    const positionStatus = position > 0 ? 'Gold' : 'Dead';

    // 상태 로그 (매 봉마다)
    signalEvents.push({
      bar: currentBar,
      type: 'LOG',
      position: positionStatus,
      macd: macdVal,
      signal: signalVal,
      price: currentPrice,
    });

    // 같은 봉에서 신호 중복 방지
    if (lastSignalBar === currentBar) {
      // 자산 계산만 수행
      const currentEquity = cash + (position > 0 ? position * currentPrice : 0);
      equity.push({
        index: i,
        timestamp: data[i].timestamp,
        equity: currentEquity,
        cash,
        position: position * currentPrice,
      });
      continue;
    }

    // === 매도 로직 ===
    if (position > 0 && entryPrice !== null) {
      const barsSinceEntry = currentBar - entryBar;
      const tpPrice = entryPrice * (1 + takeProfit);
      const slPrice = entryPrice * (1 - stopLoss);

      // 익절 또는 손절
      if (currentPrice >= tpPrice || currentPrice <= slPrice) {
        const sellAmount = position * currentPrice * (1 - commission);
        const profit = sellAmount - (position * entryPrice);
        const profitPct = ((currentPrice - entryPrice) / entryPrice) * 100;

        cash += sellAmount;

        trades.push({
          type: 'SELL',
          reason: currentPrice >= tpPrice ? 'Take Profit' : 'Stop Loss',
          index: i,
          timestamp: data[i].timestamp,
          price: currentPrice,
          quantity: position,
          profit,
          profitPct,
        });

        signalEvents.push({
          bar: currentBar,
          type: 'SELL',
          position: positionStatus,
          macd: macdVal,
          signal: signalVal,
        });

        position = 0;
        entryPrice = null;
        entryBar = null;
        lastSignalBar = currentBar;

        // 자산 계산
        const currentEquity = cash;
        equity.push({
          index: i,
          timestamp: data[i].timestamp,
          equity: currentEquity,
          cash,
          position: 0,
        });
        continue;
      }

      // 최소 보유 기간 체크
      if (barsSinceEntry < minHoldingPeriod) {
        const currentEquity = cash + position * currentPrice;
        equity.push({
          index: i,
          timestamp: data[i].timestamp,
          equity: currentEquity,
          cash,
          position: position * currentPrice,
        });
        continue;
      }

      // 매도 신호: MACD가 Signal 아래로 크로스
      if (signal[i] === undefined || (i > 0 && signal[i - 1] === undefined)) {
        const currentEquity = cash + position * currentPrice;
        equity.push({
          index: i,
          timestamp: data[i].timestamp,
          equity: currentEquity,
          cash,
          position: position * currentPrice,
        });
        continue;
      }

      const macdDiff = macd[i] - signal[i];
      const prevMacdDiff = i > 0 ? macd[i - 1] - signal[i - 1] : 0;

      if (
        macdDiff < -macdCrossoverThreshold &&
        prevMacdDiff >= 0 &&
        macd[i] >= macdThreshold
      ) {
        const sellAmount = position * currentPrice * (1 - commission);
        const profit = sellAmount - (position * entryPrice);
        const profitPct = ((currentPrice - entryPrice) / entryPrice) * 100;

        cash += sellAmount;

        trades.push({
          type: 'SELL',
          reason: 'MACD Cross Down',
          index: i,
          timestamp: data[i].timestamp,
          price: currentPrice,
          quantity: position,
          profit,
          profitPct,
        });

        signalEvents.push({
          bar: currentBar,
          type: 'SELL',
          position: positionStatus,
          macd: macdVal,
          signal: signalVal,
        });

        position = 0;
        entryPrice = null;
        entryBar = null;
        lastSignalBar = currentBar;

        const currentEquity = cash;
        equity.push({
          index: i,
          timestamp: data[i].timestamp,
          equity: currentEquity,
          cash,
          position: 0,
        });
        continue;
      }
    }

    // === 매수 로직 ===
    if (position === 0 && cash > 0) {
      // Signal이 유효한지 체크
      if (signal[i] === undefined || (i > 0 && signal[i - 1] === undefined)) {
        const currentEquity = cash;
        equity.push({
          index: i,
          timestamp: data[i].timestamp,
          equity: currentEquity,
          cash,
          position: 0,
        });
        continue;
      }

      const macdDiff = macd[i] - signal[i];
      const prevMacdDiff = i > 0 ? macd[i - 1] - signal[i - 1] : 0;

      // 매수 신호: MACD가 Signal 위로 크로스
      if (
        macdDiff > macdCrossoverThreshold &&
        prevMacdDiff <= 0 &&
        macd[i] >= macdThreshold
      ) {
        const buyAmount = cash * 0.95; // 95% 사용
        position = buyAmount / currentPrice / (1 + commission);
        cash -= buyAmount;
        entryPrice = currentPrice;
        entryBar = currentBar;

        trades.push({
          type: 'BUY',
          reason: 'MACD Cross Up',
          index: i,
          timestamp: data[i].timestamp,
          price: currentPrice,
          quantity: position,
        });

        signalEvents.push({
          bar: currentBar,
          type: 'BUY',
          position: 'Dead', // 매수 전이라 Dead
          macd: macdVal,
          signal: signalVal,
        });

        lastSignalBar = currentBar;
      }
    }

    // 자산 계산
    const currentEquity = cash + (position > 0 ? position * currentPrice : 0);
    equity.push({
      index: i,
      timestamp: data[i].timestamp,
      equity: currentEquity,
      cash,
      position: position * currentPrice,
    });
  }

  // 마지막 포지션 정리
  if (position > 0) {
    const lastPrice = prices[prices.length - 1];
    const sellAmount = position * lastPrice * (1 - commission);
    const profit = sellAmount - (position * entryPrice);
    const profitPct = ((lastPrice - entryPrice) / entryPrice) * 100;

    cash += sellAmount;

    trades.push({
      type: 'SELL',
      reason: 'End of Period',
      index: data.length - 1,
      timestamp: data[data.length - 1].timestamp,
      price: lastPrice,
      quantity: position,
      profit,
      profitPct,
    });
  }

  // 통계 계산
  const finalEquity = cash;
  const totalReturn = ((finalEquity - initialCash) / initialCash) * 100;
  const startPrice = prices[Math.max(slowPeriod, signalPeriod)];
  const endPrice = prices[prices.length - 1];
  const buyHoldReturn = ((endPrice - startPrice) / startPrice) * 100;

  const sellTrades = trades.filter(t => t.type === 'SELL');
  const winningTrades = sellTrades.filter(t => t.profit > 0);
  const losingTrades = sellTrades.filter(t => t.profit < 0);
  const winRate = sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0;

  const allProfits = sellTrades.map(t => t.profitPct);
  const avgTrade = allProfits.length > 0 ? allProfits.reduce((a, b) => a + b, 0) / allProfits.length : 0;
  const maxTrade = allProfits.length > 0 ? Math.max(...allProfits) : 0;
  const minTrade = allProfits.length > 0 ? Math.min(...allProfits) : 0;

  // 최대 낙폭 계산
  let maxDrawdown = 0;
  let peak = initialCash;
  for (const e of equity) {
    if (e.equity > peak) peak = e.equity;
    const drawdown = ((peak - e.equity) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  return {
    stats: {
      initialCash,
      finalEquity,
      totalReturn,
      buyHoldReturn,
      totalTrades: sellTrades.length,
      winRate,
      avgTrade,
      maxTrade,
      minTrade,
      maxDrawdown,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
    },
    trades,
    equity,
    signalEvents,
    indicators: {
      macd,
      signal,
    },
  };
}

// 기존 백테스팅 실행 (호환성 유지)
export function runBacktest(data, strategy) {
  const {
    initialCash = 10000000,
    commission = 0.0005,
    fastPeriod = 12,
    slowPeriod = 26,
    signalPeriod = 9,
    macdThreshold = 0,
    takeProfit = 0.03,
    stopLoss = 0.01,
    trailingStop = 0.1,
    minHoldingPeriod = 5,
    // 매수 조건
    goldenCrossEnabled = true,
    macdPositiveEnabled = false,
    signalPositiveEnabled = false,
    bullishCandleEnabled = false,
    macdTrendingUpEnabled = false,
    aboveMA20Enabled = false,
    aboveMA60Enabled = false,
    // 매도 조건
    trailingStopEnabled = true,
    takeProfitEnabled = true,
    stopLossEnabled = true,
    macdNegativeEnabled = false,
    deadCrossEnabled = false,
    // V2 모드
    useV2Logic = false,
  } = strategy;

  // V2 로직 사용 (trading-bot-v1과 동일)
  if (useV2Logic) {
    return runBacktestV2(data, {
      initialCash,
      commission,
      fastPeriod,
      slowPeriod,
      signalPeriod,
      macdThreshold,
      takeProfit,
      stopLoss,
      minHoldingPeriod,
      macdCrossoverThreshold: 0,
    });
  }

  const prices = data.map(d => d.close);
  const { macd, signal, histogram } = calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod);
  const ma20 = calculateMA(prices, 20);
  const ma60 = calculateMA(prices, 60);

  let cash = initialCash;
  let position = 0;
  let entryPrice = null;
  let entryIndex = null;
  let highestPrice = null;
  let trailingArmed = false;

  const trades = [];
  const equity = [];

  for (let i = Math.max(slowPeriod, 60); i < data.length; i++) {
    const price = prices[i];
    const currentMacd = macd[i];
    const currentSignal = signal[i];

    if (!currentMacd || !currentSignal) continue;

    // 현재 자산 계산
    const currentEquity = cash + (position > 0 ? position * price : 0);
    equity.push({
      index: i,
      timestamp: data[i].timestamp,
      equity: currentEquity,
      cash,
      position: position * price,
    });

    // 매도 로직
    if (position > 0 && entryPrice) {
      const barsHeld = i - entryIndex;
      const priceChange = (price - entryPrice) / entryPrice;

      // 손절
      if (stopLossEnabled && priceChange <= -stopLoss) {
        const sellAmount = position * price * (1 - commission);
        cash += sellAmount;
        trades.push({
          type: 'SELL',
          reason: 'Stop Loss',
          index: i,
          timestamp: data[i].timestamp,
          price,
          quantity: position,
          profit: sellAmount - (position * entryPrice),
          profitPct: priceChange * 100,
        });
        position = 0;
        entryPrice = null;
        highestPrice = null;
        trailingArmed = false;
        continue;
      }

      // 트레일링 스탑
      if (trailingStopEnabled) {
        if (!highestPrice || price > highestPrice) {
          highestPrice = price;
        }
        const trailingLimit = highestPrice * (1 - trailingStop);
        if (barsHeld >= minHoldingPeriod && price <= trailingLimit) {
          const sellAmount = position * price * (1 - commission);
          cash += sellAmount;
          trades.push({
            type: 'SELL',
            reason: 'Trailing Stop',
            index: i,
            timestamp: data[i].timestamp,
            price,
            quantity: position,
            profit: sellAmount - (position * entryPrice),
            profitPct: priceChange * 100,
          });
          position = 0;
          entryPrice = null;
          highestPrice = null;
          trailingArmed = false;
          continue;
        }
      }

      // 익절
      if (takeProfitEnabled && !trailingStopEnabled && priceChange >= takeProfit) {
        const sellAmount = position * price * (1 - commission);
        cash += sellAmount;
        trades.push({
          type: 'SELL',
          reason: 'Take Profit',
          index: i,
          timestamp: data[i].timestamp,
          price,
          quantity: position,
          profit: sellAmount - (position * entryPrice),
          profitPct: priceChange * 100,
        });
        position = 0;
        entryPrice = null;
        highestPrice = null;
        trailingArmed = false;
        continue;
      }

      // MACD 음수 돌파
      if (macdNegativeEnabled && i > 0 && macd[i - 1] >= macdThreshold && currentMacd < macdThreshold) {
        const sellAmount = position * price * (1 - commission);
        cash += sellAmount;
        trades.push({
          type: 'SELL',
          reason: 'MACD Negative',
          index: i,
          timestamp: data[i].timestamp,
          price,
          quantity: position,
          profit: sellAmount - (position * entryPrice),
          profitPct: priceChange * 100,
        });
        position = 0;
        entryPrice = null;
        highestPrice = null;
        trailingArmed = false;
        continue;
      }

      // 데드 크로스
      if (deadCrossEnabled && isDeadCross(macd, signal, i)) {
        const sellAmount = position * price * (1 - commission);
        cash += sellAmount;
        trades.push({
          type: 'SELL',
          reason: 'Dead Cross',
          index: i,
          timestamp: data[i].timestamp,
          price,
          quantity: position,
          profit: sellAmount - (position * entryPrice),
          profitPct: priceChange * 100,
        });
        position = 0;
        entryPrice = null;
        highestPrice = null;
        trailingArmed = false;
        continue;
      }
    }

    // 매수 로직
    if (position === 0 && cash > 0) {
      const buyConditions = [];

      // 골든 크로스
      if (goldenCrossEnabled) {
        buyConditions.push(isGoldenCross(macd, signal, i));
      }

      // MACD 양수 돌파
      if (macdPositiveEnabled && i > 0) {
        buyConditions.push(macd[i - 1] < macdThreshold && currentMacd >= macdThreshold);
      }

      // Signal 양수 돌파
      if (signalPositiveEnabled && i > 0) {
        buyConditions.push(signal[i - 1] < macdThreshold && currentSignal >= macdThreshold);
      }

      // 양봉
      if (bullishCandleEnabled) {
        buyConditions.push(data[i].close > data[i].open);
      }

      // MACD 상승 추세
      if (macdTrendingUpEnabled && i >= 2) {
        buyConditions.push(macd[i - 2] < macd[i - 1] && macd[i - 1] < currentMacd);
      }

      // MA20 위
      if (aboveMA20Enabled && ma20[i]) {
        buyConditions.push(price > ma20[i]);
      }

      // MA60 위
      if (aboveMA60Enabled && ma60[i]) {
        buyConditions.push(price > ma60[i]);
      }

      // 모든 활성화된 조건이 true여야 매수
      if (buyConditions.length > 0 && buyConditions.every(c => c)) {
        const buyAmount = cash * 0.95; // 95% 사용
        position = buyAmount / price / (1 + commission);
        cash -= buyAmount;
        entryPrice = price;
        entryIndex = i;
        highestPrice = price;
        trailingArmed = trailingStopEnabled;

        trades.push({
          type: 'BUY',
          reason: 'Strategy Signal',
          index: i,
          timestamp: data[i].timestamp,
          price,
          quantity: position,
        });
      }
    }
  }

  // 마지막 포지션 정리
  if (position > 0) {
    const lastPrice = prices[prices.length - 1];
    const sellAmount = position * lastPrice * (1 - commission);
    cash += sellAmount;
    trades.push({
      type: 'SELL',
      reason: 'End of Period',
      index: data.length - 1,
      timestamp: data[data.length - 1].timestamp,
      price: lastPrice,
      quantity: position,
      profit: sellAmount - (position * entryPrice),
      profitPct: ((lastPrice - entryPrice) / entryPrice) * 100,
    });
  }

  // 통계 계산
  const finalEquity = cash;
  const totalReturn = ((finalEquity - initialCash) / initialCash) * 100;
  const buyHoldReturn = ((prices[prices.length - 1] - prices[Math.max(slowPeriod, 60)]) / prices[Math.max(slowPeriod, 60)]) * 100;

  const winningTrades = trades.filter(t => t.type === 'SELL' && t.profit > 0);
  const losingTrades = trades.filter(t => t.type === 'SELL' && t.profit < 0);
  const winRate = trades.filter(t => t.type === 'SELL').length > 0
    ? (winningTrades.length / trades.filter(t => t.type === 'SELL').length) * 100
    : 0;

  const allProfits = trades.filter(t => t.type === 'SELL' && t.profitPct !== undefined).map(t => t.profitPct);
  const avgTrade = allProfits.length > 0 ? allProfits.reduce((a, b) => a + b, 0) / allProfits.length : 0;
  const maxTrade = allProfits.length > 0 ? Math.max(...allProfits) : 0;
  const minTrade = allProfits.length > 0 ? Math.min(...allProfits) : 0;

  // 최대 낙폭 계산
  let maxDrawdown = 0;
  let peak = initialCash;
  for (const e of equity) {
    if (e.equity > peak) peak = e.equity;
    const drawdown = ((peak - e.equity) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  return {
    stats: {
      initialCash,
      finalEquity,
      totalReturn,
      buyHoldReturn,
      totalTrades: trades.filter(t => t.type === 'SELL').length,
      winRate,
      avgTrade,
      maxTrade,
      minTrade,
      maxDrawdown,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
    },
    trades,
    equity,
    indicators: {
      macd,
      signal,
      histogram,
      ma20,
      ma60,
    },
  };
}
