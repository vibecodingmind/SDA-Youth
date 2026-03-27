import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Check in to an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, method } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if already checked in
    const existing = await db.checkIn.findUnique({
      where: { userId_eventId: { userId, eventId: id } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already checked in', checkIn: existing }, { status: 400 });
    }

    // Get event for points
    const event = await db.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check in and award points
    const result = await db.$transaction([
      db.checkIn.create({
        data: { userId, eventId: id, method: method || 'manual' },
      }),
      db.user.update({
        where: { id: userId },
        data: { points: { increment: event.points } },
      }),
      db.pointHistory.create({
        data: {
          userId,
          points: event.points,
          reason: `Attended event: ${event.title}`,
          type: 'earned',
        },
      }),
      db.notification.create({
        data: {
          userId,
          title: '✅ Checked In!',
          message: `You've been checked in to "${event.title}" and earned ${event.points} points!`,
          type: 'success',
        },
      }),
    ]);

    return NextResponse.json({ checkIn: result[0], pointsEarned: event.points });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
  }
}

// Get check-ins for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const checkIns = await db.checkIn.findMany({
      where: { eventId: id },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ checkIns, count: checkIns.length });
  } catch (error) {
    console.error('Check-ins fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
  }
}
