import { NextResponse } from 'next/server';

const UPBIT_API_BASE = 'https://api.upbit.com/v1';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const markets = searchParams.get('markets');

  if (!markets) {
    return NextResponse.json(
      { error: 'Markets parameter is required' },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({ markets });
    const response = await fetch(`${UPBIT_API_BASE}/ticker?${params}`, {
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
        'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('Upbit ticker API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
