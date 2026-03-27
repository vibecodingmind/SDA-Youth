import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/documents/categories - List all document categories
export async function GET() {
  try {
    const categories = await db.documentCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { documents: { where: { isPublished: true } } } },
      },
    });

    return NextResponse.json(
      categories.map((cat) => ({
        ...cat,
        documentsCount: cat._count.documents,
      }))
    );
  } catch (error) {
    console.error('Error fetching document categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document categories' },
      { status: 500 }
    );
  }
}

// POST /api/documents/categories - Create a new document category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, slug, icon, order = 0 } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    const category = await db.documentCategory.create({
      data: {
        name,
        description,
        slug,
        icon,
        order,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating document category:', error);
    return NextResponse.json(
      { error: 'Failed to create document category' },
      { status: 500 }
    );
  }
}
