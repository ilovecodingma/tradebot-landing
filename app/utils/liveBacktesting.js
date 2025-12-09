/**
 * 실시간 백테스팅 엔진
 * Python app_live.py와 동일한 기능 구현
 */

import { calculateEMA, calculateMACD } from './backtesting.js';

/**
 * 실시간 백테스팅 엔진 클래스
 */
export class LiveBacktestEngine {
  constructor(strategy, initialCash = 10000000) {
    this.strategy = strategy;
    this.initialCash = initialCash;

    // 포지션 상태
    this.cash = initialCash;
    this.position = 0;
    this.entryPrice = 0;
    this.positionStatus = null; // 'GOLD' or 'DEAD'

    // 데이터 버퍼
    this.candles = [];
    this.maxBufferSize = 500; // 최대 500개 캔들 유지

    // 지표 캐시
    this.indicators = {
      macd: [],
      signal: [],
      histogram: [],
      ma20: [],
      ma60: [],
    };

    // 거래 내역
    this.trades = [];
    this.equity = [];

    // 통계
    this.stats = {
      totalTrades: 0,
      winTrades: 0,
      loseTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      maxDrawdown: 0,
      peakEquity: initialCash,
    };

    // 신호 중복 방지
    this.lastSignalBar = null;

    // 이벤트 리스너
    this.listeners = new Map();
  }

  /**
   * 새 캔들 추가 및 전략 실행
   * @param {Object} candle - OHLCV 데이터
   */
  addCandle(candle) {
    // 캔들 추가
    this.candles.push(candle);

    // 버퍼 크기 제한
    if (this.candles.length > this.maxBufferSize) {
      this.candles.shift();
    }

    // 지표 계산
    this.updateIndicators();

    // 전략 실행
    this.executeStrategy(candle);

    // 자산 기록
    const currentEquity = this.cash + (this.position * candle.close);
    this.equity.push({
      timestamp: candle.timestamp,
      equity: currentEquity,
    });

    // 최대 낙폭 업데이트
    this.updateMaxDrawdown(currentEquity);

    // 이벤트 발생
    this.emit('update', {
      candle,
      position: this.position,
      cash: this.cash,
      equity: currentEquity,
      positionStatus: this.positionStatus,
      stats: this.getStats(),
    });
  }

  /**
   * 지표 업데이트
   */
  updateIndicators() {
    const closes = this.candles.map(c => c.close);

    // MACD 계산
    const { macd, signal, histogram } = calculateMACD(
      closes,
      this.strategy.fastPeriod || 12,
      this.strategy.slowPeriod || 26,
      this.strategy.signalPeriod || 9
    );

    this.indicators.macd = macd;
    this.indicators.signal = signal;
    this.indicators.histogram = histogram;

    // 이동평균 계산
    if (this.strategy.aboveMA20Enabled) {
      this.indicators.ma20 = calculateEMA(closes, 20);
    }
    if (this.strategy.aboveMA60Enabled) {
      this.indicators.ma60 = calculateEMA(closes, 60);
    }
  }

  /**
   * 전략 실행
   * @param {Object} candle - 현재 캔들
   */
  executeStrategy(candle) {
    const idx = this.candles.length - 1;

    // 충분한 데이터가 없으면 실행 안 함
    const minPeriod = Math.max(
      this.strategy.slowPeriod || 26,
      this.strategy.signalPeriod || 9,
      this.strategy.aboveMA60Enabled ? 60 : 0
    );

    if (idx < minPeriod) return;

    const macd = this.indicators.macd[idx];
    const signal = this.indicators.signal[idx];
    const prevMacd = this.indicators.macd[idx - 1];
    const prevSignal = this.indicators.signal[idx - 1];

    if (macd === undefined || signal === undefined) return;
    if (prevMacd === undefined || prevSignal === undefined) return;

    const price = candle.close;
    const macdDiff = macd - signal;
    const prevMacdDiff = prevMacd - prevSignal;

    // V2 로직 사용
    if (this.strategy.useV2Logic) {
      this.executeV2Strategy(candle, idx, macd, signal, prevMacd, prevSignal, price);
    } else {
      // 커스텀 로직
      this.executeCustomStrategy(candle, idx, macd, signal, prevMacd, prevSignal, price);
    }
  }

  /**
   * V2 전략 실행 (Python MACDStrategy 동일)
   */
  executeV2Strategy(candle, idx, macd, signal, prevMacd, prevSignal, price) {
    const macdDiff = macd - signal;
    const prevMacdDiff = prevMacd - prevSignal;
    const threshold = this.strategy.macdCrossoverThreshold || 0.0;

    // 신호 중복 방지
    const currentBar = candle.timestamp;
    if (this.lastSignalBar === currentBar) return;

    // 매수 신호: Golden Cross
    if (this.position === 0 && prevMacdDiff <= 0 && macdDiff > threshold) {
      // 추가 조건 확인
      if (this.strategy.aboveMA20Enabled) {
        const ma20 = this.indicators.ma20[idx];
        if (ma20 === undefined || price < ma20) return;
      }
      if (this.strategy.aboveMA60Enabled) {
        const ma60 = this.indicators.ma60[idx];
        if (ma60 === undefined || price < ma60) return;
      }

      // 매수 실행
      this.buy(candle, 'GOLDEN_CROSS');
      this.lastSignalBar = currentBar;
      this.positionStatus = 'GOLD';
    }

    // 매도 신호
    if (this.position > 0) {
      const profitRate = (price - this.entryPrice) / this.entryPrice;
      const takeProfit = this.strategy.takeProfit || 0.05;
      const stopLoss = this.strategy.stopLoss || 0.01;

      let sellReason = null;

      // 익절
      if (profitRate >= takeProfit) {
        sellReason = 'TAKE_PROFIT';
      }
      // 손절
      else if (profitRate <= -stopLoss) {
        sellReason = 'STOP_LOSS';
      }
      // Dead Cross
      else if (prevMacdDiff >= 0 && macdDiff < -threshold) {
        sellReason = 'DEAD_CROSS';
        this.positionStatus = 'DEAD';
      }

      if (sellReason) {
        this.sell(candle, sellReason);
        this.lastSignalBar = currentBar;
      }
    }
  }

  /**
   * 커스텀 전략 실행
   */
  executeCustomStrategy(candle, idx, macd, signal, prevMacd, prevSignal, price) {
    // 기존 백테스팅 로직과 동일
    const isGoldenCross = prevMacd <= prevSignal && macd > signal;
    const isDeadCross = prevMacd >= prevSignal && macd < signal;

    // 매수 신호
    if (this.position === 0 && isGoldenCross) {
      // 추가 조건 확인
      if (this.strategy.aboveMA20Enabled) {
        const ma20 = this.indicators.ma20[idx];
        if (ma20 === undefined || price < ma20) return;
      }
      if (this.strategy.aboveMA60Enabled) {
        const ma60 = this.indicators.ma60[idx];
        if (ma60 === undefined || price < ma60) return;
      }

      this.buy(candle, 'GOLDEN_CROSS');
    }

    // 매도 신호
    if (this.position > 0 && isDeadCross) {
      this.sell(candle, 'DEAD_CROSS');
    }
  }

  /**
   * 매수 실행
   */
  buy(candle, reason) {
    if (this.cash <= 0) return;

    const price = candle.close;
    const fee = this.strategy.fee || 0.0005;

    // 수량 계산 (수수료 포함)
    const amount = this.cash / (price * (1 + fee));
    const cost = amount * price;
    const feeAmount = cost * fee;

    this.position = amount;
    this.cash -= (cost + feeAmount);
    this.entryPrice = price;

    // 거래 기록
    const trade = {
      type: 'BUY',
      timestamp: candle.timestamp,
      price: price,
      amount: amount,
      cost: cost + feeAmount,
      reason: reason,
      equity: this.cash + (this.position * price),
    };

    this.trades.push(trade);
    this.stats.totalTrades++;

    this.emit('trade', trade);
    console.log(`[BUY] ${reason} @ ${price.toLocaleString()}, Amount: ${amount.toFixed(8)}`);
  }

  /**
   * 매도 실행
   */
  sell(candle, reason) {
    if (this.position <= 0) return;

    const price = candle.close;
    const fee = this.strategy.fee || 0.0005;

    // 수익 계산
    const revenue = this.position * price;
    const feeAmount = revenue * fee;
    const profit = revenue - feeAmount - (this.position * this.entryPrice);

    this.cash += (revenue - feeAmount);

    // 거래 기록
    const trade = {
      type: 'SELL',
      timestamp: candle.timestamp,
      price: price,
      amount: this.position,
      revenue: revenue - feeAmount,
      profit: profit,
      profitRate: (profit / (this.position * this.entryPrice)) * 100,
      reason: reason,
      equity: this.cash,
    };

    this.trades.push(trade);

    // 통계 업데이트
    if (profit > 0) {
      this.stats.winTrades++;
      this.stats.totalProfit += profit;
    } else {
      this.stats.loseTrades++;
      this.stats.totalLoss += Math.abs(profit);
    }

    this.position = 0;
    this.entryPrice = 0;

    this.emit('trade', trade);
    console.log(`[SELL] ${reason} @ ${price.toLocaleString()}, Profit: ${profit.toLocaleString()} (${trade.profitRate.toFixed(2)}%)`);
  }

  /**
   * 최대 낙폭 업데이트
   */
  updateMaxDrawdown(currentEquity) {
    if (currentEquity > this.stats.peakEquity) {
      this.stats.peakEquity = currentEquity;
    }

    const drawdown = (this.stats.peakEquity - currentEquity) / this.stats.peakEquity;
    if (drawdown > this.stats.maxDrawdown) {
      this.stats.maxDrawdown = drawdown;
    }
  }

  /**
   * 통계 조회
   */
  getStats() {
    const finalEquity = this.cash + (this.position * (this.candles[this.candles.length - 1]?.close || 0));
    const totalReturn = ((finalEquity - this.initialCash) / this.initialCash) * 100;
    const winRate = this.stats.totalTrades > 0 ? (this.stats.winTrades / this.stats.totalTrades) * 100 : 0;

    return {
      initialCash: this.initialCash,
      finalEquity: finalEquity,
      totalReturn: totalReturn,
      totalTrades: this.stats.totalTrades,
      winTrades: this.stats.winTrades,
      loseTrades: this.stats.loseTrades,
      winRate: winRate,
      totalProfit: this.stats.totalProfit,
      totalLoss: this.stats.totalLoss,
      maxDrawdown: this.stats.maxDrawdown * 100,
      avgProfit: this.stats.winTrades > 0 ? this.stats.totalProfit / this.stats.winTrades : 0,
      avgLoss: this.stats.loseTrades > 0 ? this.stats.totalLoss / this.stats.loseTrades : 0,
    };
  }

  /**
   * 이벤트 리스너 등록
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * 이벤트 리스너 제거
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * 이벤트 발생
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * 상태 초기화
   */
  reset() {
    this.cash = this.initialCash;
    this.position = 0;
    this.entryPrice = 0;
    this.positionStatus = null;
    this.candles = [];
    this.indicators = {
      macd: [],
      signal: [],
      histogram: [],
      ma20: [],
      ma60: [],
    };
    this.trades = [];
    this.equity = [];
    this.stats = {
      totalTrades: 0,
      winTrades: 0,
      loseTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      maxDrawdown: 0,
      peakEquity: this.initialCash,
    };
    this.lastSignalBar = null;
  }
}
