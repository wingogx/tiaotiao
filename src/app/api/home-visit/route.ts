import { NextResponse } from 'next/server';

import { trackHomeVisit } from '@/lib/home/visits';

export async function POST() {
  try {
    const visitCount = await trackHomeVisit();

    return NextResponse.json(
      { visitCount },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: 'Failed to track home visit.' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}
