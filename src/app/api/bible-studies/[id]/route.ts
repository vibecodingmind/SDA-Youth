import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/bible-studies/[id] - Get a specific bible study with sections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const bibleStudy = await db.bibleStudy.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!bibleStudy) {
      return NextResponse.json(
        { error: 'Bible study not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(bibleStudy);
  } catch (error) {
    console.error('Error fetching bible study:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bible study' },
      { status: 500 }
    );
  }
}

// PUT /api/bible-studies/[id] - Update a bible study
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const bibleStudy = await db.bibleStudy.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(bibleStudy);
  } catch (error) {
    console.error('Error updating bible study:', error);
    return NextResponse.json(
      { error: 'Failed to update bible study' },
      { status: 500 }
    );
  }
}

// DELETE /api/bible-studies/[id] - Delete a bible study
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.bibleStudy.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bible study:', error);
    return NextResponse.json(
      { error: 'Failed to delete bible study' },
      { status: 500 }
    );
  }
}
