import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Mark devotional as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { devotionalId, userId } = body;

    if (!devotionalId || !userId) {
      return NextResponse.json({ error: 'devotionalId and userId are required' }, { status: 400 });
    }

    // Check if already read
    const existing = await db.devotionalReading.findUnique({
      where: { devotionalId_userId: { devotionalId, userId } },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already marked as read', reading: existing });
    }

    // Mark as read and award points
    const result = await db.$transaction([
      db.devotionalReading.create({
        data: { devotionalId, userId },
      }),
      db.user.update({
        where: { id: userId },
        data: {
          points: { increment: 5 },
          streak: { increment: 1 },
          lastActive: new Date(),
        },
      }),
      db.pointHistory.create({
        data: {
          userId,
          points: 5,
          reason: 'Completed daily devotional',
          type: 'earned',
        },
      }),
    ]);

    return NextResponse.json({ reading: result[0], pointsEarned: 5 });
  } catch (error) {
    console.error('Devotional reading error:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
