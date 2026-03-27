import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/events/recurring/[id]/instances - Get all instances of a recurring event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const parentEvent = await db.event.findUnique({
      where: { id },
      include: {
        childEvents: {
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!parentEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (!parentEvent.isRecurring) {
      return NextResponse.json({
        message: 'This event is not a recurring event',
        event: parentEvent,
        instances: [],
      });
    }

    return NextResponse.json({
      parentEvent,
      instances: parentEvent.childEvents,
      totalCount: parentEvent.childEvents.length + 1,
    });
  } catch (error) {
    console.error('Error fetching recurring event instances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring event instances' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/recurring/[id]/instances - Delete all future instances
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { keepPast = true } = Object.fromEntries(request.nextUrl.searchParams);

    const parentEvent = await db.event.findUnique({
      where: { id },
    });

    if (!parentEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const now = new Date();

    // Delete child events
    const whereClause = keepPast
      ? { parentEventId: id, startDate: { gt: now } }
      : { parentEventId: id };

    const result = await db.event.deleteMany({
      where: whereClause,
    });

    // Update parent event to stop recurrence
    if (!keepPast) {
      await db.event.update({
        where: { id },
        data: {
          isRecurring: false,
          recurrenceEnd: now,
        },
      });
    }

    return NextResponse.json({
      message: `Deleted ${result.count} event instances`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Error deleting recurring event instances:', error);
    return NextResponse.json(
      { error: 'Failed to delete recurring event instances' },
      { status: 500 }
    );
  }
}

// PUT /api/events/recurring/[id]/instances - Update all instances
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { updateFuture = true, ...updates } = body;

    const parentEvent = await db.event.findUnique({
      where: { id },
    });

    if (!parentEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const now = new Date();

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.points) updateData.points = updates.points;

    // Update parent event
    const updatedParent = await db.event.update({
      where: { id },
      data: updateData,
    });

    // Update child events
    const whereClause = updateFuture
      ? { parentEventId: id, startDate: { gte: now } }
      : { parentEventId: id };

    const result = await db.event.updateMany({
      where: whereClause,
      data: updateData,
    });

    return NextResponse.json({
      message: `Updated ${result.count + 1} events`,
      parentEvent: updatedParent,
      updatedCount: result.count + 1,
    });
  } catch (error) {
    console.error('Error updating recurring event instances:', error);
    return NextResponse.json(
      { error: 'Failed to update recurring event instances' },
      { status: 500 }
    );
  }
}
