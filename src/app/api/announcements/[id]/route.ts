import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get a specific announcement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const announcement = await db.announcement.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true }
        }
      }
    });

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcement' },
      { status: 500 }
    );
  }
}

// PUT - Update an announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title, 
      content, 
      type, 
      priority, 
      image, 
      isPublished,
      expiresAt
    } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (type !== undefined) data.type = type;
    if (priority !== undefined) data.priority = priority;
    if (image !== undefined) data.image = image;
    if (isPublished !== undefined) {
      data.isPublished = isPublished;
      if (isPublished) {
        data.publishedAt = new Date();
      }
    }
    if (expiresAt !== undefined) {
      data.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    const announcement = await db.announcement.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true }
        }
      }
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.announcement.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
