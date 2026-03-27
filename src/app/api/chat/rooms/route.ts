import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get all chat rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = { isActive: true };
    if (type) where.type = type;

    const rooms = await db.chatRoom.findMany({
      where,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
        _count: { select: { members: true, messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Check if user is member of each room
    const roomsWithMembership = rooms.map((room) => ({
      ...room,
      isMember: userId ? room.members.some((m) => m.userId === userId) : false,
    }));

    return NextResponse.json({ rooms: roomsWithMembership });
  } catch (error) {
    console.error('Chat rooms fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat rooms' }, { status: 500 });
  }
}

// Create new chat room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, image, createdBy, memberIds } = body;

    if (!name || !createdBy) {
      return NextResponse.json({ error: 'Name and createdBy are required' }, { status: 400 });
    }

    const room = await db.chatRoom.create({
      data: {
        name,
        description,
        type: type || 'group',
        image,
        createdBy,
        members: {
          create: [
            { userId: createdBy, role: 'admin' },
            ...(memberIds || []).map((id: string) => ({ userId: id, role: 'member' })),
          ],
        },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
    });

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Chat room creation error:', error);
    return NextResponse.json({ error: 'Failed to create chat room' }, { status: 500 });
  }
}
