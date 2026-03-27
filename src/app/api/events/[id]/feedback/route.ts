import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Submit event feedback
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, rating, comment } = body;

    if (!userId || !rating) {
      return NextResponse.json({ error: 'userId and rating are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if already submitted feedback
    const existing = await db.eventFeedback.findUnique({
      where: { userId_eventId: { userId, eventId: id } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Feedback already submitted' }, { status: 400 });
    }

    const feedback = await db.eventFeedback.create({
      data: { userId, eventId: id, rating, comment },
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

// Get event feedback summary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const feedbacks = await db.eventFeedback.findMany({
      where: { eventId: id },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    const avgRating = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;

    const ratingDistribution = {
      5: feedbacks.filter(f => f.rating === 5).length,
      4: feedbacks.filter(f => f.rating === 4).length,
      3: feedbacks.filter(f => f.rating === 3).length,
      2: feedbacks.filter(f => f.rating === 2).length,
      1: feedbacks.filter(f => f.rating === 1).length,
    };

    return NextResponse.json({
      feedbacks,
      summary: {
        total: feedbacks.length,
        avgRating: Math.round(avgRating * 10) / 10,
        distribution: ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
