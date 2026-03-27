import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get all badges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where = category ? { category } : {};

    const badges = await db.badge.findMany({
      where,
      orderBy: {
        points: 'desc',
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return NextResponse.json({
      badges: badges.map((badge) => ({
        ...badge,
        earnedBy: badge._count.users,
      })),
    });
  } catch (error) {
    console.error('Badges fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

// Create new badge (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, points, category } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Badge name is required' },
        { status: 400 }
      );
    }

    const badge = await db.badge.create({
      data: {
        name,
        description,
        icon: icon || '🏅',
        points: points || 0,
        category: category || 'general',
      },
    });

    return NextResponse.json({ badge });
  } catch (error) {
    console.error('Badge creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create badge' },
      { status: 500 }
    );
  }
}
