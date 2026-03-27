import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/daily-verse/all - Get all stored bible verses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (category) where.category = category;

    const verses = await db.bibleVerse.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(verses);
  } catch (error) {
    console.error('Error fetching bible verses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bible verses' },
      { status: 500 }
    );
  }
}

// POST /api/daily-verse/all - Add a new bible verse
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reference,
      text,
      translation = 'NKJV',
      book,
      chapter,
      verse,
      category,
    } = body;

    if (!reference || !text || !book || !chapter || !verse) {
      return NextResponse.json(
        { error: 'Missing required fields: reference, text, book, chapter, verse' },
        { status: 400 }
      );
    }

    const newVerse = await db.bibleVerse.create({
      data: {
        reference,
        text,
        translation,
        book,
        chapter,
        verse,
        category,
      },
    });

    return NextResponse.json(newVerse, { status: 201 });
  } catch (error) {
    console.error('Error creating bible verse:', error);
    return NextResponse.json(
      { error: 'Failed to create bible verse' },
      { status: 500 }
    );
  }
}
