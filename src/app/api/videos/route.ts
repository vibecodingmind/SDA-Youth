import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/videos - List all videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    const where: any = { isPublished: true };
    if (categoryId) where.categoryId = categoryId;
    if (featured === 'true') where.isFeatured = true;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [videos, total] = await Promise.all([
      db.video.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
        include: { category: true },
      }),
      db.video.count({ where }),
    ]);

    return NextResponse.json({
      videos,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// POST /api/videos - Create a new video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      categoryId,
      author,
      tags,
      isPublished = true,
      isFeatured = false,
    } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: title, videoUrl' },
        { status: 400 }
      );
    }

    const video = await db.video.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration,
        categoryId,
        author,
        tags,
        isPublished,
        isFeatured,
        publishedAt: isPublished ? new Date() : null,
      },
      include: { category: true },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}
