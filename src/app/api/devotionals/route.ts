import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get devotionals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '7');

    const where = date ? { date: new Date(date) } : {};

    const devotionals = await db.devotional.findMany({
      where,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        _count: { select: { readings: true } },
      },
    });

    return NextResponse.json({ devotionals });
  } catch (error) {
    console.error('Devotionals fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch devotionals' }, { status: 500 });
  }
}

// Create devotional (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, scripture, verse, author, date } = body;

    if (!title || !content || !scripture) {
      return NextResponse.json({ error: 'title, content, and scripture are required' }, { status: 400 });
    }

    const devotional = await db.devotional.create({
      data: {
        title,
        content,
        scripture,
        verse,
        author,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ devotional });
  } catch (error) {
    console.error('Devotional creation error:', error);
    return NextResponse.json({ error: 'Failed to create devotional' }, { status: 500 });
  }
}
