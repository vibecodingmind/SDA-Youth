import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get rewards
export async function GET(request: NextRequest) {
  try {
    const rewards = await db.reward.findMany({
      where: { isActive: true },
      orderBy: { points: 'asc' },
    });

    return NextResponse.json({ rewards });
  } catch (error) {
    console.error('Rewards fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
  }
}

// Create reward (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, image, points, stock } = body;

    if (!name || !points) {
      return NextResponse.json({ error: 'name and points are required' }, { status: 400 });
    }

    const reward = await db.reward.create({
      data: {
        name,
        description,
        image,
        points,
        stock: stock || 0,
      },
    });

    return NextResponse.json({ reward });
  } catch (error) {
    console.error('Reward creation error:', error);
    return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 });
  }
}
