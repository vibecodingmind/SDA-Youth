import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/events/[id]/rsvp - Get all RSVPs for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const rsvps = await db.rSVP.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate statistics
    const stats = {
      total: rsvps.length,
      registered: rsvps.filter(r => r.status === 'registered').length,
      attended: rsvps.filter(r => r.status === 'attended').length,
      cancelled: rsvps.filter(r => r.status === 'cancelled').length,
    };

    return NextResponse.json({ rsvps, stats });
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSVPs' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/rsvp - Create or update RSVP
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { userId, status = 'registered' } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if RSVP already exists
    const existingRsvp = await db.rSVP.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existingRsvp) {
      // Update existing RSVP
      const updatedRsvp = await db.rSVP.update({
        where: { id: existingRsvp.id },
        data: { status },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json({
        message: 'RSVP updated successfully',
        rsvp: updatedRsvp,
      });
    }

    // Create new RSVP
    const rsvp = await db.rSVP.create({
      data: {
        userId,
        eventId,
        status,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      message: 'RSVP created successfully',
      rsvp,
    });
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return NextResponse.json(
      { error: 'Failed to create RSVP' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/rsvp - Cancel RSVP
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { userId } = Object.fromEntries(request.nextUrl.searchParams);

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await db.rSVP.delete({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    return NextResponse.json({ message: 'RSVP cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling RSVP:', error);
    return NextResponse.json(
      { error: 'Failed to cancel RSVP' },
      { status: 500 }
    );
  }
}
