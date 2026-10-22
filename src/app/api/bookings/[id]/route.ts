import { NextRequest, NextResponse } from 'next/server';
import {
  getBookingById,
  updateBookingStatus,
  rescheduleBooking,
  cancelBooking,
} from '@/lib/db';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Booking with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Booking with ID ${id} not found` },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { status, date, time } = body;

    let updatedBooking = booking;

    // Reschedule if date/time provided
    if (date && time) {
      const today = new Date().toISOString().split('T')[0];
      if (date < today) {
        return NextResponse.json(
          { success: false, error: 'Cannot reschedule to a past date.' },
          { status: 400 }
        );
      }
      updatedBooking = (await rescheduleBooking(id, date, time))!;
    }

    // Update status if provided
    if (status) {
      const validStatuses = ['Pending', 'Confirmed', 'Done', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          },
          { status: 400 }
        );
      }
      updatedBooking = (await updateBookingStatus(id, status))!;
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    const statusCode = error.message?.includes('already booked') ? 409 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update booking' },
      { status: statusCode }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const cancelled = await cancelBooking(id);
    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: `Booking with ID ${id} not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: cancelled,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
