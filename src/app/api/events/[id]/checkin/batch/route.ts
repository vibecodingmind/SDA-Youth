import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateBatchCheckInCodes } from '@/lib/qrcode';

// POST /api/events/[id]/checkin/batch - Create batch check-in codes
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { count = 10 } = body;

    // Verify event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Generate batch of unique codes
    const codes = generateBatchCheckInCodes(count);

    // Create check-in records for each code
    const checkIns = await Promise.all(
      codes.map(checkInCode =>
        db.checkIn.create({
          data: {
            eventId,
            checkInCode,
            status: 'registered',
          },
        })
      )
    );

    return NextResponse.json({
      message: `Created ${checkIns.length} check-in codes`,
      checkIns,
    });
  } catch (error) {
    console.error('Error creating batch check-ins:', error);
    return NextResponse.json(
      { error: 'Failed to create batch check-ins' },
      { status: 500 }
    );
  }
}
