import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get small groups
export async function GET(request: NextRequest) {
  try {
    const groups = await db.smallGroup.findMany({
      where: { status: 'active' },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Groups fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

// Create small group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, leaderId, capacity, image, meetingTime, location } = body;

    if (!name || !leaderId) {
      return NextResponse.json({ error: 'name and leaderId are required' }, { status: 400 });
    }

    const group = await db.smallGroup.create({
      data: {
        name,
        description,
        leaderId,
        capacity: capacity || 15,
        image,
        meetingTime,
        location,
        members: {
          create: { userId: leaderId, role: 'leader' },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Group creation error:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
