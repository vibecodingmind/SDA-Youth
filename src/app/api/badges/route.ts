import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrSet, CacheTTL, CacheKeys, invalidateCache } from '@/lib/cache';

// Get all badges (with caching)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const cacheKey = category 
      ? `${CacheKeys.badges()}:category:${category}`
      : CacheKeys.badges();

    const badges = await getOrSet(
      cacheKey,
      async () => {
        const where = category ? { category } : {};

        const result = await db.badge.findMany({
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

        return result.map((badge) => ({
          ...badge,
          earnedBy: badge._count.users,
        }));
      },
      CacheTTL.BADGES
    );

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Badges fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

// Create new badge (admin only) - invalidate cache on create
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

    // Invalidate badges cache
    invalidateCache('badges:*');

    return NextResponse.json({ badge });
  } catch (error) {
    console.error('Badge creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create badge' },
      { status: 500 }
    );
  }
}
