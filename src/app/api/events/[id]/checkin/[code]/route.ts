import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/events/[id]/checkin/[code] - Verify and get check-in details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; code: string }> }
) {
  try {
    const { id: eventId, code } = await params;

    const checkIn = await db.checkIn.findUnique({
      where: { checkInCode: code },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
      },
    });

    if (!checkIn || checkIn.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Invalid check-in code' },
        { status: 404 }
      );
    }

    return NextResponse.json({ checkIn });
  } catch (error) {
    console.error('Error fetching check-in:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-in' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/checkin/[code] - Process check-in scan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; code: string }> }
) {
  try {
    const { id: eventId, code } = await params;
    const body = await request.json();
    const { method = 'qr' } = body;

    const checkIn = await db.checkIn.findUnique({
      where: { checkInCode: code },
      include: { event: true },
    });

    if (!checkIn || checkIn.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Invalid check-in code' },
        { status: 404 }
      );
    }

    if (checkIn.status === 'checked_in') {
      return NextResponse.json({
        success: false,
        message: 'Already checked in',
        checkIn,
      });
    }

    // Update check-in status
    const updatedCheckIn = await db.checkIn.update({
      where: { id: checkIn.id },
      data: {
        status: 'checked_in',
        checkedInAt: new Date(),
        checkInMethod: method,
      },
    });

    // Award points to user if registered
    if (checkIn.userId) {
      await db.user.update({
        where: { id: checkIn.userId },
        data: {
          points: {
            increment: checkIn.event.points,
          },
        },
      });

      // Create point history
      await db.pointHistory.create({
        data: {
          userId: checkIn.userId,
          points: checkIn.event.points,
          reason: `Checked in to event: ${checkIn.event.title}`,
          type: 'earned',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Check-in successful',
      checkIn: updatedCheckIn,
    });
  } catch (error) {
    console.error('Error processing check-in:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
}
