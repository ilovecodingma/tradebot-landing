import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
    const data = await response.json();

    // USDT 거래쌍만 필터링
    const symbols = data.symbols
      .filter(symbol =>
        symbol.status === 'TRADING' &&
        symbol.quoteAsset === 'USDT'
      )
      .map(symbol => ({
        symbol: symbol.symbol,
        baseAsset: symbol.baseAsset,
        quoteAsset: symbol.quoteAsset,
        name: `${symbol.baseAsset}/USDT`
      }))
      .sort((a, b) => a.baseAsset.localeCompare(b.baseAsset));

    return NextResponse.json({ symbols });
  } catch (error) {
    console.error('Binance API error:', error);
    return NextResponse.json(
      { error: '바이낸스 심볼을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
