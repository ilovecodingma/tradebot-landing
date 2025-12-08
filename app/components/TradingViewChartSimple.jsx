'use client';

import { memo } from 'react';

function TradingViewChartSimple({ symbol = 'BINANCE:BTCUSDT', interval = 'D', theme = 'light', height = 500 }) {
  // 심볼을 URL 인코딩
  const encodedSymbol = encodeURIComponent(symbol);

  // TradingView 임베드 URL 생성 (iframe 방식 - WebSocket 불필요)
  const embedUrl = `https://www.tradingview.com/embed-widget/advanced-chart/?symbol=${encodedSymbol}&interval=${interval}&theme=${theme}&locale=kr&timezone=Asia%2FSeoul&style=1&withdateranges=true&hide_side_toolbar=false&allow_symbol_change=true&save_image=false&hide_top_toolbar=false&hide_legend=false&calendar=false&support_host=https%3A%2F%2Fwww.tradingview.com`;

  return (
    <div className="tradingview-widget-container" style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
      <iframe
        src={embedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '4px'
        }}
        frameBorder="0"
        allowTransparency="true"
        scrolling="no"
        allowFullScreen
        title={`TradingView Chart - ${symbol}`}
      />
      <div className="tradingview-widget-copyright" style={{
        fontSize: '11px',
        textAlign: 'center',
        marginTop: '4px',
        color: '#999'
      }}>
        <a
          href={`https://kr.tradingview.com/symbols/${symbol.replace(':', '-')}/`}
          rel="noopener noreferrer"
          target="_blank"
          style={{ color: '#2962FF', textDecoration: 'none' }}
        >
          <span>{symbol}</span>
        </a>
        {' '}by TradingView
      </div>
    </div>
  );
}

export default memo(TradingViewChartSimple);
