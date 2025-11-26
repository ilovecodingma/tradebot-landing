/**
 * MACD 백테스팅 유틸리티
 * 다양한 전략을 커스터마이징할 수 있는 백테스팅 엔진
 */

// EMA 계산
function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  const ema = [];

  // 첫 번째 값은 SMA로 시작
  let sum = 0;
  for (let i = 0; i < Math.min(period, data.length); i++) {
    sum += data[i];
  }
  ema[period - 1] = sum / period;

  // EMA 계산
  for (let i = period; i < data.length; i++) {
    ema[i] = data[i] * k + ema[i - 1] * (1 - k);
  }

  return ema;
}

// MACD 계산
export function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  const macd = [];
  for (let i = 0; i < prices.length; i++) {
    if (fastEMA[i] !== undefined && slowEMA[i] !== undefined) {
      macd[i] = fastEMA[i] - slowEMA[i];
    }
  }

  const signal = calculateEMA(macd.filter(v => v !== undefined), signalPeriod);
  const histogram = [];

  let signalIndex = 0;
  for (let i = 0; i < macd.length; i++) {
    if (macd[i] !== undefined && signal[signalIndex] !== undefined) {
      histogram[i] = macd[i] - signal[signalIndex];
      signalIndex++;
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
  const prevDelta = macd[index - 1] - signal[index - 1];
  const currDelta = macd[index] - signal[index];
  return prevDelta <= 0 && currDelta > 0;
}

// 데드 크로스 감지
function isDeadCross(macd, signal, index) {
  if (index < 1) return false;
  const prevDelta = macd[index - 1] - signal[index - 1];
  const currDelta = macd[index] - signal[index];
  return prevDelta >= 0 && currDelta < 0;
}

// 백테스팅 실행
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
  } = strategy;

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
