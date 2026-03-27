import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List posts (optionally filtered by topic)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = { isDeleted: false };
    if (topicId) where.topicId = topicId;

    const posts = await db.forumPost.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true }
        },
        topic: {
          select: { id: true, title: true }
        }
      }
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forum posts' },
      { status: 500 }
    );
  }
}

// POST - Create a new post (reply)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, topicId, authorId } = body;

    if (!content || !topicId || !authorId) {
      return NextResponse.json(
        { error: 'content, topicId, and authorId are required' },
        { status: 400 }
      );
    }

    // Check if topic is locked
    const topic = await db.forumTopic.findUnique({
      where: { id: topicId }
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    if (topic.isLocked) {
      return NextResponse.json(
        { error: 'Topic is locked and cannot receive new posts' },
        { status: 403 }
      );
    }

    const post = await db.forumPost.create({
      data: {
        content,
        topicId,
        authorId
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true }
        }
      }
    });

    // Update topic's updatedAt
    await db.forumTopic.update({
      where: { id: topicId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating forum post:', error);
    return NextResponse.json(
      { error: 'Failed to create forum post' },
      { status: 500 }
    );
  }
}
