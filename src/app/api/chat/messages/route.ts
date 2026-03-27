import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Send a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, senderId, content, type, replyTo } = body;

    if (!roomId || !senderId || !content) {
      return NextResponse.json({ error: 'roomId, senderId, and content are required' }, { status: 400 });
    }

    const message = await db.chatMessage.create({
      data: {
        roomId,
        senderId,
        content,
        type: type || 'text',
        replyTo,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    // Update room's updatedAt
    await db.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
