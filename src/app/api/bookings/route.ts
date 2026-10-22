import { NextRequest, NextResponse } from 'next/server';
import {
  getBookings,
  createBooking,
  isSlotBooked,
  getAllServices,
} from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get('date') || undefined;
    const status = req.nextUrl.searchParams.get('status') || undefined;
    const search = req.nextUrl.searchParams.get('search') || undefined;

    const bookings = await getBookings({ date, status, search });
    return NextResponse.json({
      success: true,
      data: bookings,
      total: bookings.length,
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_name, customerName, phone, service, date, time } = body;

    const name = (customer_name || customerName || '').trim();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanService = (service || '').trim();
    const cleanDate = (date || '').trim();
    const cleanTime = (time || '').trim();

    // 1. Missing fields validation
    if (!name || !cleanPhone || !cleanService || !cleanDate || !cleanTime) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields. Please provide customer_name, phone, service, date, and time.',
        },
        { status: 400 }
      );
    }

    // 2. Phone validation (exact 10 digits)
    if (!/^\d{10}$/.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number must be exactly 10 digits (e.g. 9876543210).',
        },
        { status: 400 }
      );
    }

    // 3. Past date validation
    const today = new Date().toISOString().split('T')[0];
    if (cleanDate < today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking date cannot be in the past.',
        },
        { status: 400 }
      );
    }

    // 4. Validate service exists
    const services = await getAllServices();
    const validService = services.find(
      (s) => s.name.toLowerCase() === cleanService.toLowerCase()
    );
    if (!validService) {
      return NextResponse.json(
        {
          success: false,
          error: `Selected service '${cleanService}' is not offered.`,
        },
        { status: 400 }
      );
    }

    // 5. Double-booking check
    const booked = await isSlotBooked(cleanDate, cleanTime);
    if (booked) {
      return NextResponse.json(
        {
          success: false,
          error: `The slot ${cleanTime} on ${cleanDate} is already booked. Please choose another slot.`,
        },
        { status: 409 }
      );
    }

    // Create booking
    const newBooking = await createBooking({
      customer_name: name,
      phone: cleanPhone,
      service: validService.name,
      date: cleanDate,
      time: cleanTime,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Your booking is confirmed for ${newBooking.time}, ${newBooking.date}`,
        data: newBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        {
          success: false,
          error: 'This time slot is already booked. Please choose another time.',
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
