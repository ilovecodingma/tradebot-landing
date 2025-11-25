/**
 * Upbit API 연동 유틸리티
 */

const UPBIT_API_BASE = 'https://api.upbit.com/v1';

// 인터벌 매핑
export const INTERVALS = {
  '1분': { value: 'minutes/1', label: '1분', unit: 1 },
  '3분': { value: 'minutes/3', label: '3분', unit: 3 },
  '5분': { value: 'minutes/5', label: '5분', unit: 5 },
  '10분': { value: 'minutes/10', label: '10분', unit: 10 },
  '15분': { value: 'minutes/15', label: '15분', unit: 15 },
  '30분': { value: 'minutes/30', label: '30분', unit: 30 },
  '60분': { value: 'minutes/60', label: '60분', unit: 60 },
  '240분': { value: 'minutes/240', label: '240분', unit: 240 },
  '일봉': { value: 'days', label: '일봉', unit: 1440 },
  '주봉': { value: 'weeks', label: '주봉', unit: 10080 },
  '월봉': { value: 'months', label: '월봉', unit: 43200 },
};

// 지연 함수 (API Rate Limit 대응)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Upbit에서 OHLCV 데이터 가져오기
 * @param {string} market - 마켓 코드 (예: KRW-BTC)
 * @param {string} interval - 인터벌
 * @param {number} count - 가져올 캔들 개수
 * @returns {Promise<Array>} OHLCV 데이터 배열
 */
export async function getOHLCV(market, interval = '5분', count = 200) {
  try {
    const intervalPath = INTERVALS[interval]?.value || 'minutes/5';
    const url = `${UPBIT_API_BASE}/candles/${intervalPath}`;

    // 200개씩 최대 요청 가능
    const maxPerRequest = 200;
    const numRequests = Math.ceil(count / maxPerRequest);
    const allData = [];

    for (let i = 0; i < numRequests; i++) {
      const requestCount = Math.min(maxPerRequest, count - (i * maxPerRequest));
      const params = new URLSearchParams({
        market,
        count: requestCount.toString(),
      });

      // 이전 데이터의 마지막 캔들 시간을 기준으로
      if (allData.length > 0) {
        const lastCandle = allData[allData.length - 1];
        params.append('to', lastCandle.candle_date_time_kst);
      }

      const response = await fetch(`${url}?${params}`);

      if (!response.ok) {
        throw new Error(`Upbit API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // 중복 제거하고 추가
      const newData = i === 0 ? data : data.slice(1);
      allData.push(...newData);

      // Rate limit 대응 (초당 10회 제한)
      if (i < numRequests - 1) {
        await delay(100);
      }
    }

    // 데이터 정규화 (오래된 것부터)
    return allData.reverse().map(candle => ({
      timestamp: candle.candle_date_time_kst || candle.candle_date_time_utc,
      open: candle.opening_price,
      high: candle.high_price,
      low: candle.low_price,
      close: candle.trade_price,
      volume: candle.candle_acc_trade_volume,
    }));
  } catch (error) {
    console.error('Failed to fetch OHLCV data:', error);
    throw error;
  }
}

/**
 * 거래 가능한 마켓 목록 가져오기
 * @param {string} quoteCurrency - 기준 통화 (KRW, BTC, USDT)
 * @returns {Promise<Array>} 마켓 목록
 */
export async function getMarkets(quoteCurrency = 'KRW') {
  try {
    const response = await fetch(`${UPBIT_API_BASE}/market/all`);

    if (!response.ok) {
      throw new Error(`Upbit API Error: ${response.status} ${response.statusText}`);
    }

    const markets = await response.json();

    // 특정 기준 통화로 필터링
    const filtered = markets.filter(m => m.market.startsWith(`${quoteCurrency}-`));

    return filtered.map(m => ({
      market: m.market,
      korean_name: m.korean_name,
      english_name: m.english_name,
    }));
  } catch (error) {
    console.error('Failed to fetch markets:', error);
    throw error;
  }
}

/**
 * 현재 가격 조회
 * @param {Array<string>} markets - 마켓 코드 배열
 * @returns {Promise<Array>} 현재가 정보
 */
export async function getCurrentPrices(markets) {
  try {
    const params = new URLSearchParams({
      markets: markets.join(','),
    });

    const response = await fetch(`${UPBIT_API_BASE}/ticker?${params}`);

    if (!response.ok) {
      throw new Error(`Upbit API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch current prices:', error);
    throw error;
  }
}

// 샘플 데이터 생성 (개발/테스트용)
export function generateSampleData(count = 200) {
  const data = [];
  let price = 50000000; // BTC 시작 가격
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * price * 0.02; // ±1% 변동
    price += change;

    const open = price;
    const close = price + (Math.random() - 0.5) * price * 0.01;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.random() * 100;

    data.push({
      timestamp: new Date(now.getTime() - (count - i) * 5 * 60 * 1000).toISOString(),
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return data;
}
