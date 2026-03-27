import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/events/[id]/gallery - Get all galleries for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const galleries = await db.photoGallery.findMany({
      where: { eventId },
      include: {
        photos: {
          orderBy: { order: 'asc' },
          take: 5, // Preview photos
        },
        _count: {
          select: { photos: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ galleries });
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch galleries' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/gallery - Create a new gallery
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { title, description, coverImage, isPublic = true, createdBy } = body;

    // Verify event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const gallery = await db.photoGallery.create({
      data: {
        eventId,
        title,
        description,
        coverImage,
        isPublic,
        createdBy,
      },
    });

    return NextResponse.json({ gallery });
  } catch (error) {
    console.error('Error creating gallery:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]/gallery - Update a gallery
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { galleryId, updates } = body;

    const gallery = await db.photoGallery.update({
      where: { id: galleryId, eventId },
      data: updates,
    });

    return NextResponse.json({ gallery });
  } catch (error) {
    console.error('Error updating gallery:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/gallery - Delete a gallery
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { galleryId, deletePhotos = false } = Object.fromEntries(
      request.nextUrl.searchParams
    );

    if (!galleryId) {
      return NextResponse.json(
        { error: 'galleryId is required' },
        { status: 400 }
      );
    }

    // Delete photos if requested
    if (deletePhotos === 'true') {
      await db.eventPhoto.deleteMany({
        where: { galleryId },
      });
    } else {
      // Unlink photos from gallery
      await db.eventPhoto.updateMany({
        where: { galleryId },
        data: { galleryId: null },
      });
    }

    // Delete gallery
    await db.photoGallery.delete({
      where: { id: galleryId, eventId },
    });

    return NextResponse.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery' },
      { status: 500 }
    );
  }
}
