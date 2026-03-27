import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get forum categories with topics
export async function GET(request: NextRequest) {
  try {
    const categories = await db.forumCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        topics: {
          take: 5,
          orderBy: { updatedAt: 'desc' },
          include: {
            author: { select: { id: true, name: true, image: true } },
            _count: { select: { posts: true } },
          },
        },
        _count: { select: { topics: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Forum categories fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// Create a new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, order } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const category = await db.forumCategory.create({
      data: { name, description, icon, order: order || 0 },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
