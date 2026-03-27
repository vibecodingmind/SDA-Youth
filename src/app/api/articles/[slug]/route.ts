import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/articles/[slug] - Get article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const article = await db.article.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.article.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ ...article, viewCount: article.viewCount + 1 });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[slug] - Update an article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const article = await db.article.update({
      where: { slug },
      data: {
        ...body,
        updatedAt: new Date(),
        publishedAt: body.isPublished && !body.publishedAt ? new Date() : body.publishedAt,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[slug] - Delete an article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await db.article.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
