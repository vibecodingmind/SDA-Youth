import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Redeem a reward
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get reward and user
    const [reward, user] = await Promise.all([
      db.reward.findUnique({ where: { id } }),
      db.user.findUnique({ where: { id: userId } }),
    ]);

    if (!reward || !user) {
      return NextResponse.json({ error: 'Reward or user not found' }, { status: 404 });
    }

    if (reward.stock <= 0) {
      return NextResponse.json({ error: 'Reward out of stock' }, { status: 400 });
    }

    if (user.points < reward.points) {
      return NextResponse.json({ error: 'Not enough points' }, { status: 400 });
    }

    // Redeem reward
    const result = await db.$transaction([
      db.rewardRedemption.create({
        data: { rewardId: id, userId, status: 'pending' },
      }),
      db.reward.update({
        where: { id },
        data: { stock: { decrement: 1 } },
      }),
      db.user.update({
        where: { id: userId },
        data: { points: { decrement: reward.points } },
      }),
      db.pointHistory.create({
        data: {
          userId,
          points: -reward.points,
          reason: `Redeemed: ${reward.name}`,
          type: 'spent',
        },
      }),
      db.notification.create({
        data: {
          userId,
          title: '🎁 Reward Redeemed!',
          message: `You've redeemed "${reward.name}" for ${reward.points} points.`,
          type: 'success',
        },
      }),
    ]);

    return NextResponse.json({ redemption: result[0], pointsSpent: reward.points });
  } catch (error) {
    console.error('Redemption error:', error);
    return NextResponse.json({ error: 'Failed to redeem reward' }, { status: 500 });
  }
}
