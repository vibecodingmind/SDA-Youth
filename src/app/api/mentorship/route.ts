import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get mentorships
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // mentor or mentee

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const where = role === 'mentor' 
      ? { mentorId: userId, status: 'active' }
      : role === 'mentee'
      ? { menteeId: userId, status: 'active' }
      : { OR: [{ mentorId: userId }, { menteeId: userId }], status: 'active' };

    const mentorships = await db.mentorship.findMany({
      where,
      include: {
        mentor: { select: { id: true, name: true, image: true, email: true } },
        mentee: { select: { id: true, name: true, image: true, email: true } },
      },
    });

    return NextResponse.json({ mentorships });
  } catch (error) {
    console.error('Mentorships fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch mentorships' }, { status: 500 });
  }
}

// Create mentorship
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentorId, menteeId, notes } = body;

    if (!mentorId || !menteeId) {
      return NextResponse.json({ error: 'mentorId and menteeId are required' }, { status: 400 });
    }

    // Check if mentorship already exists
    const existing = await db.mentorship.findFirst({
      where: { mentorId, menteeId, status: 'active' },
    });

    if (existing) {
      return NextResponse.json({ error: 'Mentorship already exists' }, { status: 400 });
    }

    const mentorship = await db.mentorship.create({
      data: { mentorId, menteeId, notes },
      include: {
        mentor: { select: { id: true, name: true, image: true } },
        mentee: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ mentorship });
  } catch (error) {
    console.error('Mentorship creation error:', error);
    return NextResponse.json({ error: 'Failed to create mentorship' }, { status: 500 });
  }
}
