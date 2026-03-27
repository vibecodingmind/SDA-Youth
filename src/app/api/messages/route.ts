import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    const messages = await db.directMessage.findMany({
      where: {
        conversationId,
        ...(before && { createdAt: { lt: new Date(before) } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// Send a direct message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, senderId, receiverId, content, type } = body;

    if (!conversationId || !senderId || !receiverId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message = await db.directMessage.create({
      data: {
        conversationId,
        senderId,
        receiverId,
        content,
        type: type || 'text',
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    // Update conversation's updatedAt
    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
