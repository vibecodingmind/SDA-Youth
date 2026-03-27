import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/documents - List all documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categoryId = searchParams.get('categoryId');
    const fileType = searchParams.get('fileType');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    const where: any = { isPublished: true };
    if (categoryId) where.categoryId = categoryId;
    if (fileType) where.fileType = fileType;
    if (featured === 'true') where.isFeatured = true;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [documents, total] = await Promise.all([
      db.document.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
        include: { category: true },
      }),
      db.document.count({ where }),
    ]);

    return NextResponse.json({
      documents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      categoryId,
      author,
      tags,
      isPublished = true,
      isFeatured = false,
    } = body;

    if (!title || !fileUrl || !fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, fileUrl, fileName, fileType' },
        { status: 400 }
      );
    }

    const document = await db.document.create({
      data: {
        title,
        description,
        fileUrl,
        fileName,
        fileType,
        fileSize: fileSize || 0,
        categoryId,
        author,
        tags,
        isPublished,
        isFeatured,
      },
      include: { category: true },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
