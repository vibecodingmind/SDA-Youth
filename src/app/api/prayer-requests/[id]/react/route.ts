import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// React to a prayer request (pray/amen)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, type } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if already reacted
    const existing = await db.prayerReaction.findUnique({
      where: { requestId_userId: { requestId: id, userId } },
    });

    if (existing) {
      // Remove reaction
      await db.prayerReaction.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ reacted: false });
    }

    // Add reaction
    const reaction = await db.prayerReaction.create({
      data: { requestId: id, userId, type: type || 'praying' },
    });

    return NextResponse.json({ reacted: true, reaction });
  } catch (error) {
    console.error('Prayer reaction error:', error);
    return NextResponse.json({ error: 'Failed to react' }, { status: 500 });
  }
}
