import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get all prayer requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '20');

    const requests = await db.prayerRequest.findMany({
      where: { status },
      include: {
        author: { select: { id: true, name: true, image: true } },
        reactions: {
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { reactions: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Prayer requests fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch prayer requests' }, { status: 500 });
  }
}

// Create a prayer request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authorId, title, content, isAnonymous } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const prayerRequest = await db.prayerRequest.create({
      data: {
        authorId: isAnonymous ? null : authorId,
        title,
        content,
        isAnonymous: isAnonymous || false,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ request: prayerRequest });
  } catch (error) {
    console.error('Prayer request creation error:', error);
    return NextResponse.json({ error: 'Failed to create prayer request' }, { status: 500 });
  }
}
