import { NextResponse } from 'next/server';

const UPBIT_API_BASE = 'https://api.upbit.com/v1';

export async function GET() {
  try {
    const response = await fetch(`${UPBIT_API_BASE}/market/all`, {
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
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Upbit markets API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
