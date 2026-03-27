import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/bible-studies - List all bible studies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const book = searchParams.get('book');
    const difficulty = searchParams.get('difficulty');

    const where: any = { isPublished: true };
    if (book) where.book = book;
    if (difficulty) where.difficulty = difficulty;

    const [bibleStudies, total] = await Promise.all([
      db.bibleStudy.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          _count: { select: { sections: true } },
        },
      }),
      db.bibleStudy.count({ where }),
    ]);

    return NextResponse.json({
      bibleStudies: bibleStudies.map((study) => ({
        ...study,
        sectionsCount: study._count.sections,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching bible studies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bible studies' },
      { status: 500 }
    );
  }
}

// POST /api/bible-studies - Create a new bible study
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      book,
      chapters,
      difficulty = 'beginner',
      imageUrl,
      duration = 30,
      points = 10,
      isPublished = true,
      sections = [],
    } = body;

    if (!title || !book) {
      return NextResponse.json(
        { error: 'Missing required fields: title, book' },
        { status: 400 }
      );
    }

    const bibleStudy = await db.bibleStudy.create({
      data: {
        title,
        description,
        book,
        chapters,
        difficulty,
        imageUrl,
        duration,
        points,
        isPublished,
        sections: {
          create: sections.map((section: any, index: number) => ({
            title: section.title,
            content: section.content,
            scriptureRefs: section.scriptureRefs,
            order: index,
          })),
        },
      },
      include: { sections: true },
    });

    return NextResponse.json(bibleStudy, { status: 201 });
  } catch (error) {
    console.error('Error creating bible study:', error);
    return NextResponse.json(
      { error: 'Failed to create bible study' },
      { status: 500 }
    );
  }
}
