import { NextResponse } from 'next/server';

const UPBIT_API_BASE = 'https://api.upbit.com/v1';

// 지연 함수 (API Rate Limit 대응)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const market = searchParams.get('market');
  const interval = searchParams.get('interval');
  const count = parseInt(searchParams.get('count') || '200');

  if (!market || !interval) {
    return NextResponse.json(
      { error: 'Market and interval are required' },
      { status: 400 }
    );
  }

  try {
    const url = `${UPBIT_API_BASE}/candles/${interval}`;

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

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Upbit API error: ${response.status}`);
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

    return NextResponse.json(allData, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('Upbit candles API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
