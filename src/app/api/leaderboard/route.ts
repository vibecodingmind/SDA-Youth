import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const timeframe = searchParams.get('timeframe') || 'all'; // all, month, week

    let dateFilter = {};
    const now = new Date();
    
    if (timeframe === 'week') {
      dateFilter = {
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      };
    } else if (timeframe === 'month') {
      dateFilter = {
        createdAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      };
    }

    // Get users with their points
    const users = await db.user.findMany({
      where: {
        isActive: true,
        ...dateFilter,
      },
      orderBy: {
        points: 'desc',
      },
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        points: true,
        badges: {
          select: {
            badge: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    // Calculate rank
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name || 'Anonymous',
      email: user.email,
      image: user.image,
      points: user.points,
      badges: user.badges.map((b) => b.badge),
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
