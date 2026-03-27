import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/devotionals/today - Get today's devotional
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try to find today's devotional
    let devotional = await db.devotional.findFirst({
      where: {
        date: today,
        isPublished: true,
      },
    });

    // If no devotional for today, find the most recent one
    if (!devotional) {
      devotional = await db.devotional.findFirst({
        where: {
          date: { lte: today },
          isPublished: true,
        },
        orderBy: { date: 'desc' },
      });
    }

    if (!devotional) {
      return NextResponse.json(
        { error: 'No devotional available' },
        { status: 404 }
      );
    }

    return NextResponse.json(devotional);
  } catch (error) {
    console.error('Error fetching today\'s devotional:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s devotional' },
      { status: 500 }
    );
  }
}
