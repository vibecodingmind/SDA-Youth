import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE - Delete a message (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const message = await db.chatMessage.update({
      where: { id },
      data: { isDeleted: true }
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}

// PUT - Edit a message
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const message = await db.chatMessage.update({
      where: { id },
      data: { content },
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error editing message:', error);
    return NextResponse.json(
      { error: 'Failed to edit message' },
      { status: 500 }
    );
  }
}
