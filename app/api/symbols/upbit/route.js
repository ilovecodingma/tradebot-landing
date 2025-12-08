import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.upbit.com/v1/market/all');
    const data = await response.json();

    // KRW 마켓만 필터링
    const symbols = data
      .filter(market => market.market.startsWith('KRW-'))
      .map(market => {
        const baseAsset = market.market.replace('KRW-', '');
        return {
          symbol: `${baseAsset}KRW`,
          baseAsset: baseAsset,
          quoteAsset: 'KRW',
          name: `${baseAsset}/KRW`,
          koreanName: market.korean_name
        };
      })
      .sort((a, b) => a.baseAsset.localeCompare(b.baseAsset));

    return NextResponse.json({ symbols });
  } catch (error) {
    console.error('Upbit API error:', error);
    return NextResponse.json(
      { error: '업비트 심볼을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
