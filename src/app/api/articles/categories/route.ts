import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/articles/categories - List all article categories
export async function GET() {
  try {
    const categories = await db.articleCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { articles: { where: { isPublished: true } } } },
      },
    });

    return NextResponse.json(
      categories.map((cat) => ({
        ...cat,
        articlesCount: cat._count.articles,
      }))
    );
  } catch (error) {
    console.error('Error fetching article categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article categories' },
      { status: 500 }
    );
  }
}

// POST /api/articles/categories - Create a new article category
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

    const category = await db.articleCategory.create({
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
    console.error('Error creating article category:', error);
    return NextResponse.json(
      { error: 'Failed to create article category' },
      { status: 500 }
    );
  }
}
