import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Edit a post
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

    const post = await db.forumPost.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error editing forum post:', error);
    return NextResponse.json(
      { error: 'Failed to edit forum post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a post (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.forumPost.update({
      where: { id },
      data: { isDeleted: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    return NextResponse.json(
      { error: 'Failed to delete forum post' },
      { status: 500 }
    );
  }
}
