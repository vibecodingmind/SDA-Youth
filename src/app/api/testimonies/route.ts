import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get testimonies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'approved';
    const limit = parseInt(searchParams.get('limit') || '10');

    const testimonies = await db.testimony.findMany({
      where: { status },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ testimonies });
  } catch (error) {
    console.error('Testimonies fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonies' }, { status: 500 });
  }
}

// Create testimony
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authorId, title, content, scripture, tags, isAnonymous } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 });
    }

    const testimony = await db.testimony.create({
      data: {
        authorId: isAnonymous ? null : authorId,
        title,
        content,
        scripture,
        tags,
        isAnonymous: isAnonymous || false,
      },
    });

    return NextResponse.json({ testimony });
  } catch (error) {
    console.error('Testimony creation error:', error);
    return NextResponse.json({ error: 'Failed to create testimony' }, { status: 500 });
  }
}
