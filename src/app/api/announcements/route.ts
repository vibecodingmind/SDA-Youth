import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get all active announcements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');

    const now = new Date();

    const announcements = await db.announcement.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { publishAt: null },
              { publishAt: { lte: now } },
            ],
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
          {
            OR: [
              { targetRole: null },
              { targetRole: role },
            ],
          },
        ],
      },
      take: limit,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Announcements fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// Create new announcement (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, image, priority, targetRole, publishAt, expiresAt, authorId } = body;

    if (!title || !content || !authorId) {
      return NextResponse.json({ error: 'Title, content, and authorId are required' }, { status: 400 });
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        image,
        priority: priority || 'normal',
        targetRole,
        publishAt: publishAt ? new Date(publishAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        authorId,
      },
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Announcement creation error:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
