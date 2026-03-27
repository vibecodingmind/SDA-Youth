import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get event photos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const photos = await db.eventPhoto.findMany({
      where: { eventId: id },
      include: {
        event: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Photos fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

// Upload event photo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { url, caption, uploadedBy } = body;

    if (!url || !uploadedBy) {
      return NextResponse.json({ error: 'url and uploadedBy are required' }, { status: 400 });
    }

    const photo = await db.eventPhoto.create({
      data: { eventId: id, url, caption, uploadedBy },
    });

    return NextResponse.json({ photo });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
