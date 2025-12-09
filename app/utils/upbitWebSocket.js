/**
 * Upbit WebSocket 실시간 데이터 스트리밍 유틸리티
 * Python data_feed.py의 stream_candles() 함수와 동일한 기능 구현
 */

const UPBIT_WS_URL = 'wss://api.upbit.com/websocket/v1';

/**
 * WebSocket 연결 상태
 */
export const WS_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
};

/**
 * Upbit WebSocket 클라이언트 클래스
 */
export class UpbitWebSocketClient {
  constructor() {
    this.ws = null;
    this.status = WS_STATUS.DISCONNECTED;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.pingInterval = null;
  }

  /**
   * WebSocket 연결
   * @param {Array<string>} markets - 마켓 코드 배열 (예: ['KRW-BTC', 'KRW-ETH'])
   * @param {string} type - 구독 타입 ('ticker', 'trade', 'orderbook')
   */
  connect(markets, type = 'ticker') {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('Already connected to WebSocket');
      return;
    }

    this.status = WS_STATUS.CONNECTING;
    this.emit('status', this.status);

    try {
      this.ws = new WebSocket(UPBIT_WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.status = WS_STATUS.CONNECTED;
        this.reconnectAttempts = 0;
        this.emit('status', this.status);

        // 구독 메시지 전송
        const subscribeMessage = [
          { ticket: 'unique_ticket' },
          {
            type: type,
            codes: markets,
            isOnlyRealtime: true,
          },
          { format: 'DEFAULT' },
        ];

        this.ws.send(JSON.stringify(subscribeMessage));

        // Ping 전송 (연결 유지)
        this.startPing();
      };

      this.ws.onmessage = async (event) => {
        try {
          // Blob을 텍스트로 변환
          const text = await event.data.text();
          const data = JSON.parse(text);

          // 데이터 타입별 처리
          if (data.type === 'ticker') {
            this.emit('ticker', data);
          } else if (data.type === 'trade') {
            this.emit('trade', data);
          } else if (data.type === 'orderbook') {
            this.emit('orderbook', data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.status = WS_STATUS.ERROR;
        this.emit('status', this.status);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.status = WS_STATUS.DISCONNECTED;
        this.emit('status', this.status);
        this.stopPing();

        // 자동 재연결
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => {
            this.connect(markets, type);
          }, this.reconnectDelay);
        }
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.status = WS_STATUS.ERROR;
      this.emit('status', this.status);
      this.emit('error', error);
    }
  }

  /**
   * WebSocket 연결 해제
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopPing();
    this.status = WS_STATUS.DISCONNECTED;
    this.emit('status', this.status);
  }

  /**
   * Ping 전송 시작 (연결 유지)
   */
  startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30초마다 ping
  }

  /**
   * Ping 전송 중지
   */
  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * 이벤트 리스너 등록
   * @param {string} event - 이벤트 이름 ('ticker', 'trade', 'orderbook', 'status', 'error')
   * @param {Function} callback - 콜백 함수
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * 이벤트 리스너 제거
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 콜백 함수
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
   * @param {string} event - 이벤트 이름
   * @param {*} data - 이벤트 데이터
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
   * 연결 상태 확인
   * @returns {boolean}
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

/**
 * 실시간 캔들 스트리밍 (Python stream_candles 동일)
 * @param {string} market - 마켓 코드
 * @param {string} interval - 인터벌 (1분, 5분, 15분 등)
 * @param {Function} onCandle - 새 캔들 콜백
 * @param {Function} onError - 에러 콜백
 * @returns {UpbitWebSocketClient}
 */
export function streamCandles(market, interval = '5분', onCandle, onError) {
  const client = new UpbitWebSocketClient();

  // 현재 캔들 집계용
  let currentCandle = null;
  let candleStartTime = null;

  // 인터벌에 따른 밀리초 계산
  const intervalMs = getIntervalMs(interval);

  // Ticker 데이터로 캔들 집계
  client.on('ticker', (ticker) => {
    const now = new Date();
    const candleTime = new Date(Math.floor(now.getTime() / intervalMs) * intervalMs);

    // 새로운 캔들 시작
    if (!currentCandle || candleStartTime.getTime() !== candleTime.getTime()) {
      // 이전 캔들 완성
      if (currentCandle) {
        onCandle(currentCandle);
      }

      // 새 캔들 초기화
      currentCandle = {
        timestamp: candleTime.toISOString(),
        open: ticker.opening_price,
        high: ticker.high_price,
        low: ticker.low_price,
        close: ticker.trade_price,
        volume: ticker.acc_trade_volume_24h,
        market: ticker.code,
      };
      candleStartTime = candleTime;
    } else {
      // 기존 캔들 업데이트
      currentCandle.high = Math.max(currentCandle.high, ticker.high_price);
      currentCandle.low = Math.min(currentCandle.low, ticker.low_price);
      currentCandle.close = ticker.trade_price;
      currentCandle.volume = ticker.acc_trade_volume_24h;
    }
  });

  client.on('error', (error) => {
    if (onError) {
      onError(error);
    }
  });

  // 연결 시작
  client.connect([market], 'ticker');

  return client;
}

/**
 * 인터벌을 밀리초로 변환
 * @param {string} interval
 * @returns {number}
 */
function getIntervalMs(interval) {
  const intervalMap = {
    '1분': 60 * 1000,
    '3분': 3 * 60 * 1000,
    '5분': 5 * 60 * 1000,
    '10분': 10 * 60 * 1000,
    '15분': 15 * 60 * 1000,
    '30분': 30 * 60 * 1000,
    '60분': 60 * 60 * 1000,
    '240분': 240 * 60 * 1000,
    '일봉': 24 * 60 * 60 * 1000,
  };

  return intervalMap[interval] || 5 * 60 * 1000; // 기본값 5분
}
