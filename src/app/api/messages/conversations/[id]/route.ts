import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    const where: Record<string, unknown> = { 
      conversationId: id, 
      isDeleted: false 
    };

    if (before) {
      const beforeMessage = await db.directMessage.findUnique({
        where: { id: before }
      });
      if (beforeMessage) {
        where.createdAt = { lt: beforeMessage.createdAt };
      }
    }

    const messages = await db.directMessage.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a message to conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, type = 'text', fileUrl, senderId } = body;

    if (!content || !senderId) {
      return NextResponse.json(
        { error: 'content and senderId are required' },
        { status: 400 }
      );
    }

    // Verify user is a participant
    const participant = await db.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: senderId } }
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'User is not a participant in this conversation' },
        { status: 403 }
      );
    }

    const message = await db.directMessage.create({
      data: {
        content,
        type,
        fileUrl,
        conversationId: id,
        senderId
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    // Update conversation's updatedAt
    await db.conversation.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PUT - Mark messages as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Update participant's lastRead timestamp
    await db.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: id, userId } },
      data: { lastRead: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
