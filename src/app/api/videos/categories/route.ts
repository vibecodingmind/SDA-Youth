import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/videos/categories - List all video categories
export async function GET() {
  try {
    const categories = await db.videoCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { videos: { where: { isPublished: true } } } },
      },
    });

    return NextResponse.json(
      categories.map((cat) => ({
        ...cat,
        videosCount: cat._count.videos,
      }))
    );
  } catch (error) {
    console.error('Error fetching video categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video categories' },
      { status: 500 }
    );
  }
}

// POST /api/videos/categories - Create a new video category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, slug, icon, order = 0 } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    const category = await db.videoCategory.create({
      data: {
        name,
        description,
        slug,
        icon,
        order,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating video category:', error);
    return NextResponse.json(
      { error: 'Failed to create video category' },
      { status: 500 }
    );
  }
}
