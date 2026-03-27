import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/documents/download - Track a document download
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Missing required field: documentId' },
        { status: 400 }
      );
    }

    const document = await db.document.update({
      where: { id: documentId },
      data: { downloadCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      downloadCount: document.downloadCount,
    });
  } catch (error) {
    console.error('Error tracking download:', error);
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 500 }
    );
  }
}
