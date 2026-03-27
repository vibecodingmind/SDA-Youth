import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateEventCheckInQR, generateCheckInCode } from '@/lib/qrcode';

// GET /api/events/[id] - Get a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await db.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true },
        },
        rsvps: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        checkIns: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        photos: {
          where: { isFeatured: true },
          take: 5,
        },
        galleries: {
          take: 5,
        },
        feedback: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        surveyQuestions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            rsvps: true,
            checkIns: true,
            photos: true,
            feedback: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Calculate check-in statistics
    const checkInStats = await db.checkIn.groupBy({
      by: ['status'],
      where: { eventId: id },
      _count: true,
    });

    // Calculate feedback statistics
    const feedbackStats = await db.eventFeedback.aggregate({
      where: { eventId: id },
      _avg: { overallRating: true },
      _count: true,
    });

    // Check if event is a child of a recurring event
    let parentEvent = null;
    if (event.parentEventId) {
      parentEvent = await db.event.findUnique({
        where: { id: event.parentEventId },
        select: { id: true, title: true, isRecurring: true },
      });
    }

    return NextResponse.json({
      event,
      parentEvent,
      statistics: {
        checkIns: checkInStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {} as Record<string, number>),
        feedback: {
          averageRating: feedbackStats._avg.overallRating,
          total: feedbackStats._count,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      image,
      points,
      status,
      isRecurring,
      recurrenceType,
      recurrenceEnd,
      recurrenceCount,
      recurrenceDays,
    } = body;

    const event = await db.event.update({
      where: { id },
      data: {
        title,
        description,
        location,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        image,
        points,
        status,
        isRecurring,
        recurrenceType,
        recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : undefined,
        recurrenceCount,
        recurrenceDays,
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { deleteChildren = false } = Object.fromEntries(
      request.nextUrl.searchParams
    );

    // Check if this is a recurring event with children
    const event = await db.event.findUnique({
      where: { id },
      include: {
        _count: { select: { childEvents: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete child events if requested
    if (deleteChildren === 'true' && event._count.childEvents > 0) {
      await db.event.deleteMany({
        where: { parentEventId: id },
      });
    }

    // Delete related records
    await db.checkIn.deleteMany({ where: { eventId: id } });
    await db.rSVP.deleteMany({ where: { eventId: id } });
    await db.surveyResponse.deleteMany({
      where: { feedback: { eventId: id } },
    });
    await db.eventFeedback.deleteMany({ where: { eventId: id } });
    await db.surveyQuestion.deleteMany({ where: { eventId: id } });
    await db.eventPhoto.deleteMany({ where: { eventId: id } });
    await db.photoGallery.deleteMany({ where: { eventId: id } });

    // Delete the event
    await db.event.delete({ where: { id } });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
