import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to calculate next occurrence date
function getNextOccurrence(
  startDate: Date,
  recurrenceType: string,
  recurrenceDays?: string
): Date {
  const next = new Date(startDate);

  switch (recurrenceType) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setDate(next.getDate() + 1);
  }

  return next;
}

// Helper function to calculate all occurrences within a date range
function calculateOccurrences(
  startDate: Date,
  endDate: Date | null,
  recurrenceType: string,
  recurrenceEnd: Date | null,
  recurrenceCount: number | null,
  recurrenceDays?: string | null
): Date[] {
  const occurrences: Date[] = [];
  let current = new Date(startDate);
  let count = 0;
  const maxOccurrences = recurrenceCount || 100; // Safety limit
  const endLimit = recurrenceEnd || new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year default

  while (count < maxOccurrences && current <= endLimit) {
    if (recurrenceType === 'weekly' && recurrenceDays) {
      // For weekly recurrence with specific days
      const days = recurrenceDays.split(',').map(Number);
      const dayOfWeek = current.getDay();
      if (days.includes(dayOfWeek)) {
        occurrences.push(new Date(current));
        count++;
      }
      current.setDate(current.getDate() + 1);
    } else {
      occurrences.push(new Date(current));
      count++;
      current = getNextOccurrence(current, recurrenceType);
    }
  }

  return occurrences;
}

// GET /api/events/recurring - Get all recurring events
export async function GET(request: NextRequest) {
  try {
    const recurringEvents = await db.event.findMany({
      where: {
        isRecurring: true,
        parentEventId: null, // Only parent events
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { childEvents: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ events: recurringEvents });
  } catch (error) {
    console.error('Error fetching recurring events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring events' },
      { status: 500 }
    );
  }
}

// POST /api/events/recurring - Create a recurring event with instances
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      image,
      points = 10,
      creatorId,
      recurrenceType,
      recurrenceEnd,
      recurrenceCount,
      recurrenceDays,
      generateInstances = true,
    } = body;

    if (!recurrenceType) {
      return NextResponse.json(
        { error: 'recurrenceType is required' },
        { status: 400 }
      );
    }

    // Create the parent recurring event
    const parentEvent = await db.event.create({
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        image,
        points,
        creatorId,
        isRecurring: true,
        recurrenceType,
        recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
        recurrenceCount: recurrenceCount || null,
        recurrenceDays: recurrenceDays || null,
      },
    });

    // Generate child event instances
    if (generateInstances) {
      const occurrences = calculateOccurrences(
        new Date(startDate),
        endDate ? new Date(endDate) : null,
        recurrenceType,
        recurrenceEnd ? new Date(recurrenceEnd) : null,
        recurrenceCount,
        recurrenceDays
      );

      // Calculate duration for child events
      const duration = endDate
        ? new Date(endDate).getTime() - new Date(startDate).getTime()
        : null;

      // Create child events
      const childEvents = await Promise.all(
        occurrences.slice(1).map((occurrence, index) => {
          const childEndDate = duration
            ? new Date(occurrence.getTime() + duration)
            : null;

          return db.event.create({
            data: {
              title,
              description,
              location,
              startDate: occurrence,
              endDate: childEndDate,
              image,
              points,
              creatorId,
              isRecurring: true,
              recurrenceType,
              parentEventId: parentEvent.id,
            },
          });
        })
      );

      return NextResponse.json({
        message: 'Recurring event created successfully',
        parentEvent,
        childEventsCount: childEvents.length,
      });
    }

    return NextResponse.json({
      message: 'Recurring event template created',
      parentEvent,
    });
  } catch (error) {
    console.error('Error creating recurring event:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring event' },
      { status: 500 }
    );
  }
}
