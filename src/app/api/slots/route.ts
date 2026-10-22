import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'date query parameter is required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots(date);
    return NextResponse.json({
      success: true,
      date,
      slots,
    });
  } catch (error: any) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}
