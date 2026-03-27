import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Complete a challenge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challengeId, userId } = body;

    if (!challengeId || !userId) {
      return NextResponse.json({ error: 'challengeId and userId are required' }, { status: 400 });
    }

    // Check if already completed
    const existing = await db.dailyChallengeCompletion.findUnique({
      where: { challengeId_userId: { challengeId, userId } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Challenge already completed' }, { status: 400 });
    }

    // Get challenge for points
    const challenge = await db.dailyChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Complete challenge and award points
    const result = await db.$transaction([
      db.dailyChallengeCompletion.create({
        data: { challengeId, userId },
      }),
      db.user.update({
        where: { id: userId },
        data: { points: { increment: challenge.points } },
      }),
      db.pointHistory.create({
        data: {
          userId,
          points: challenge.points,
          reason: `Completed challenge: ${challenge.title}`,
          type: 'earned',
        },
      }),
      db.notification.create({
        data: {
          userId,
          title: '🎯 Challenge Complete!',
          message: `You've completed "${challenge.title}" and earned ${challenge.points} points!`,
          type: 'achievement',
        },
      }),
    ]);

    return NextResponse.json({ completion: result[0], pointsEarned: challenge.points });
  } catch (error) {
    console.error('Challenge completion error:', error);
    return NextResponse.json({ error: 'Failed to complete challenge' }, { status: 500 });
  }
}
