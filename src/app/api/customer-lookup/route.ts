import { NextRequest, NextResponse } from 'next/server';
import { getBookingsByPhone, getBookingById } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone');
    const id = req.nextUrl.searchParams.get('id');

    if (id) {
      const booking = await getBookingById(id);
      return NextResponse.json({
        success: true,
        data: booking ? [booking] : [],
      });
    }

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const bookings = await getBookingsByPhone(cleanPhone);
      return NextResponse.json({
        success: true,
        data: bookings,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Either phone or id query param is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Customer lookup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lookup failed' },
      { status: 500 }
    );
  }
}
