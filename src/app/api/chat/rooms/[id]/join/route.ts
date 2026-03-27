import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Join a chat room
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

    // Check if already a member
    const existingMember = await db.chatRoomMember.findUnique({
      where: { roomId_userId: { roomId: id, userId } }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    const member = await db.chatRoomMember.create({
      data: {
        roomId: id,
        userId,
        role: 'member'
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Error joining chat room:', error);
    return NextResponse.json(
      { error: 'Failed to join chat room' },
      { status: 500 }
    );
  }
}

// DELETE - Leave a chat room
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
      where: { roomId_userId: { roomId: id, userId } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving chat room:', error);
    return NextResponse.json(
      { error: 'Failed to leave chat room' },
      { status: 500 }
    );
  }
}
