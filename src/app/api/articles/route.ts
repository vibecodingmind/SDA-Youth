import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/articles - List all articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    const where: any = { isPublished: true };
    if (categoryId) where.categoryId = categoryId;
    if (featured === 'true') where.isFeatured = true;
    if (tag) where.tags = { contains: tag };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
        take: limit,
        skip: offset,
        include: { category: true },
      }),
      db.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create a new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      categoryId,
      authorId,
      author,
      tags,
      readTime,
      isPublished = false,
      isFeatured = false,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, content' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await db.article.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Article with this slug already exists' },
        { status: 400 }
      );
    }

    const article = await db.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        categoryId,
        authorId,
        author,
        tags,
        readTime,
        isPublished,
        isFeatured,
        publishedAt: isPublished ? new Date() : null,
      },
      include: { category: true },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
