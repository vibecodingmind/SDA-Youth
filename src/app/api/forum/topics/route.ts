import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get all topics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = categoryId ? { categoryId } : {};

    const [topics, total] = await Promise.all([
      db.forumTopic.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        include: {
          author: { select: { id: true, name: true, image: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { posts: true } },
        },
      }),
      db.forumTopic.count({ where }),
    ]);

    return NextResponse.json({ topics, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Forum topics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

// Create a new topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, authorId, title, content } = body;

    if (!categoryId || !authorId || !title || !content) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const topic = await db.forumTopic.create({
      data: { categoryId, authorId, title, content },
      include: {
        author: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true } },
      },
    });

    // Create first post
    await db.forumPost.create({
      data: { topicId: topic.id, authorId, content },
    });

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Topic creation error:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
