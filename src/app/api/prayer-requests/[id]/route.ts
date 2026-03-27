import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get a specific prayer request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const prayer = await db.prayerRequest.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, image: true }
        },
        reactions: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        },
        _count: {
          select: { reactions: true }
        }
      }
    });

    if (!prayer) {
      return NextResponse.json({ error: 'Prayer request not found' }, { status: 404 });
    }

    return NextResponse.json({ prayer });
  } catch (error) {
    console.error('Error fetching prayer request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prayer request' },
      { status: 500 }
    );
  }
}

// PUT - Update a prayer request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, isPrivate, isUrgent, isAnswered } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (isPrivate !== undefined) data.isPrivate = isPrivate;
    if (isUrgent !== undefined) data.isUrgent = isUrgent;
    if (isAnswered !== undefined) {
      data.isAnswered = isAnswered;
      if (isAnswered) {
        data.answeredAt = new Date();
      }
    }

    const prayer = await db.prayerRequest.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    return NextResponse.json({ prayer });
  } catch (error) {
    console.error('Error updating prayer request:', error);
    return NextResponse.json(
      { error: 'Failed to update prayer request' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a prayer request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.prayerRequest.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prayer request:', error);
    return NextResponse.json(
      { error: 'Failed to delete prayer request' },
      { status: 500 }
    );
  }
}
