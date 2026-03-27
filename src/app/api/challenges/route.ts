import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get daily challenges
export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenges = await db.dailyChallenge.findMany({
      where: {
        date: today,
        isActive: true,
      },
      include: {
        _count: { select: { completions: true } },
      },
    });

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error('Challenges fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

// Create daily challenge (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, points, type, targetCount, date } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const challenge = await db.dailyChallenge.create({
      data: {
        title,
        description,
        points: points || 10,
        type,
        targetCount: targetCount || 1,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('Challenge creation error:', error);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}
