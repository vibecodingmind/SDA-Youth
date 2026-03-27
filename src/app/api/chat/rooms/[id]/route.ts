import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get messages for a room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    const messages = await db.chatMessage.findMany({
      where: {
        roomId: id,
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

// Join a chat room
export async function POST(
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

    const member = await db.chatRoomMember.create({
      data: { roomId: id, userId },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Join room error:', error);
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}

// Leave a chat room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await db.chatRoomMember.delete({
      where: { roomId_userId: { roomId: id, userId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leave room error:', error);
    return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
  }
}
