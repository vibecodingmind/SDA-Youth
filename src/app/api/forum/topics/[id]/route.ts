import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get single topic with posts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const topic = await db.forumTopic.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true } },
      },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Increment view count
    await db.forumTopic.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const [posts, total] = await Promise.all([
      db.forumPost.findMany({
        where: { topicId: id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, name: true, image: true, role: true } },
        },
      }),
      db.forumPost.count({ where: { topicId: id } }),
    ]);

    return NextResponse.json({
      topic,
      posts,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Topic fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 });
  }
}

// Add a post/reply to topic
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { authorId, content } = body;

    if (!authorId || !content) {
      return NextResponse.json({ error: 'authorId and content are required' }, { status: 400 });
    }

    const post = await db.forumPost.create({
      data: { topicId: id, authorId, content },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
      },
    });

    // Update topic's updatedAt
    await db.forumTopic.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
