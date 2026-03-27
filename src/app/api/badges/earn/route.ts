import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Award badge to user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, badgeId } = body;

    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: 'userId and badgeId are required' },
        { status: 400 }
      );
    }

    // Check if user already has this badge
    const existingBadge = await db.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
    });

    if (existingBadge) {
      return NextResponse.json(
        { error: 'User already has this badge' },
        { status: 400 }
      );
    }

    // Get badge details for points
    const badge = await db.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    // Award badge and add points in a transaction
    const result = await db.$transaction([
      db.userBadge.create({
        data: {
          userId,
          badgeId,
        },
      }),
      db.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: badge.points,
          },
        },
      }),
      db.pointHistory.create({
        data: {
          userId,
          points: badge.points,
          reason: `Earned badge: ${badge.name}`,
          type: 'earned',
        },
      }),
      db.notification.create({
        data: {
          userId,
          title: '🏆 Badge Earned!',
          message: `You've earned the "${badge.name}" badge!`,
          type: 'achievement',
          link: '/dashboard/badges',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      badge: badge,
      pointsEarned: badge.points,
    });
  } catch (error) {
    console.error('Badge award error:', error);
    return NextResponse.json(
      { error: 'Failed to award badge' },
      { status: 500 }
    );
  }
}
