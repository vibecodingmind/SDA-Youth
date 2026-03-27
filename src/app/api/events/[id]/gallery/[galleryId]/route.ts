import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/events/[id]/gallery/[galleryId] - Get a specific gallery with all photos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; galleryId: string }> }
) {
  try {
    const { id: eventId, galleryId } = await params;

    const gallery = await db.photoGallery.findFirst({
      where: { id: galleryId, eventId },
      include: {
        photos: {
          orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }

    return NextResponse.json({ gallery });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}
