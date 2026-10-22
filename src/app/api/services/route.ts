import { NextResponse } from 'next/server';
import { getAllServices } from '@/lib/db';

export async function GET() {
  try {
    const services = await getAllServices();
    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
