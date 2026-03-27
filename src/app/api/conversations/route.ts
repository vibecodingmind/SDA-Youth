import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const conversations = await db.conversation.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Conversations fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// Start a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, initialMessage, senderId } = body;

    if (!userIds || userIds.length < 2) {
      return NextResponse.json({ error: 'At least 2 users are required' }, { status: 400 });
    }

    // Check if conversation already exists between these users
    const existing = await db.conversation.findFirst({
      where: {
        AND: userIds.map((id: string) => ({
          members: { some: { userId: id } },
        })),
      },
    });

    if (existing) {
      return NextResponse.json({ conversation: existing, exists: true });
    }

    // Create new conversation
    const conversation = await db.conversation.create({
      data: {
        members: {
          create: userIds.map((id: string) => ({ userId: id })),
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    // Send initial message if provided
    if (initialMessage && senderId) {
      const receiverId = userIds.find((id: string) => id !== senderId);
      await db.directMessage.create({
        data: {
          conversationId: conversation.id,
          senderId,
          receiverId,
          content: initialMessage,
        },
      });
    }

    return NextResponse.json({ conversation, exists: false });
  } catch (error) {
    console.error('Conversation creation error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
