import { NextResponse } from 'next/server';

// Upbit API 프록시 - CORS 문제 해결
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const market = searchParams.get('market');
  const interval = searchParams.get('interval');
  const count = searchParams.get('count') || '200';

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
  }

  try {
    let url = `https://api.upbit.com/v1/${endpoint}`;
    const params = new URLSearchParams();

    if (market) params.append('market', market);
    if (interval) params.append('minutes', interval);
    if (count) params.append('count', count);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Upbit API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('Upbit API proxy error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
