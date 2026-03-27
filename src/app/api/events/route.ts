import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrSet, CacheTTL, CacheKeys, invalidateCache } from '@/lib/cache';

// GET /api/events - Get all events with filters (with caching)
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const {
      status,
      upcoming,
      past,
      recurring,
      limit = '20',
      offset = '0',
    } = searchParams;

    // Build cache key based on filters
    const cacheKey = `${CacheKeys.eventsList(status)}:${upcoming}:${past}:${recurring}:${limit}:${offset}`;

    const result = await getOrSet(
      cacheKey,
      async () => {
        const where: Record<string, unknown> = {};

        // Apply filters
        if (status) {
          where.status = status;
        }

        if (upcoming === 'true') {
          where.startDate = { gte: new Date() };
          where.status = { notIn: ['cancelled', 'completed'] };
        }

        if (past === 'true') {
          where.startDate = { lt: new Date() };
        }

        if (recurring === 'true') {
          where.isRecurring = true;
        } else if (recurring === 'false') {
          where.isRecurring = false;
        }

        const events = await db.event.findMany({
          where,
          include: {
            creator: {
              select: { id: true, name: true, email: true, image: true },
            },
            _count: {
              select: { rsvps: true, checkIns: true, photos: true },
            },
          },
          orderBy: { startDate: 'asc' },
          take: parseInt(limit),
          skip: parseInt(offset),
        });

        const total = await db.event.count({ where });

        return {
          events,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + events.length < total,
          },
        };
      },
      CacheTTL.EVENTS_LIST
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event (invalidate cache on create)
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
      isRecurring = false,
      recurrenceType,
      recurrenceEnd,
      recurrenceCount,
      recurrenceDays,
    } = body;

    if (!title || !startDate || !creatorId) {
      return NextResponse.json(
        { error: 'title, startDate, and creatorId are required' },
        { status: 400 }
      );
    }

    const event = await db.event.create({
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        image,
        points,
        creatorId,
        isRecurring,
        recurrenceRule: isRecurring ? recurrenceType : null,
        recurrenceEnd: isRecurring && recurrenceEnd ? new Date(recurrenceEnd) : null,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Invalidate events cache
    invalidateCache('events:list:*');

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
