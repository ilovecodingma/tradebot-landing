'use client';

import { useEffect, useRef, memo } from 'react';

function TradingViewChart({ symbol = 'BINANCE:BTCUSDT', interval = 'D', theme = 'light', height = 500 }) {
  const containerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // TradingView 스크립트 로드
    const loadTradingViewScript = () => {
      return new Promise((resolve, reject) => {
        if (window.TradingView) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // 위젯 초기화
    const initWidget = () => {
      if (!containerRef.current || !window.TradingView) return;

      // 기존 위젯 제거
      containerRef.current.innerHTML = '';

      new window.TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: interval,
        timezone: 'Asia/Seoul',
        theme: theme,
        style: '1',
        locale: 'kr',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: containerRef.current.id,
        studies: [],
        show_popup_button: true,
        popup_width: '1000',
        popup_height: '650',
        support_host: 'https://www.tradingview.com'
      });
    };

    if (!scriptLoadedRef.current) {
      loadTradingViewScript()
        .then(() => {
          scriptLoadedRef.current = true;
          initWidget();
        })
        .catch((error) => {
          console.error('TradingView script load error:', error);
        });
    } else {
      initWidget();
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme]);

  return (
    <div className="tradingview-widget-container" style={{ height: `${height}px`, width: '100%' }}>
      <div
        id={`tradingview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}
        ref={containerRef}
        style={{ height: '100%', width: '100%' }}
      />
      <div className="tradingview-widget-copyright">
        <a
          href={`https://kr.tradingview.com/symbols/${symbol.replace(':', '-')}/`}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="blue-text">{symbol}</span>
        </a>
        <span> by TradingView</span>
      </div>
    </div>
  );
}

export default memo(TradingViewChart);
