import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/articles/like - Like/unlike an article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, userId } = body;

    if (!articleId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: articleId, userId' },
        { status: 400 }
      );
    }

    // Check if already liked
    const existingLike = await db.articleLike.findUnique({
      where: {
        articleId_userId: { articleId, userId },
      },
    });

    if (existingLike) {
      // Unlike
      await db.articleLike.delete({
        where: { id: existingLike.id },
      });

      await db.article.update({
        where: { id: articleId },
        data: { likeCount: { decrement: 1 } },
      });

      return NextResponse.json({ liked: false });
    } else {
      // Like
      await db.articleLike.create({
        data: { articleId, userId },
      });

      await db.article.update({
        where: { id: articleId },
        data: { likeCount: { increment: 1 } },
      });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

// GET /api/articles/like - Check if user liked an article
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    const userId = searchParams.get('userId');

    if (!articleId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: articleId, userId' },
        { status: 400 }
      );
    }

    const like = await db.articleLike.findUnique({
      where: {
        articleId_userId: { articleId, userId },
      },
    });

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { status: 500 }
    );
  }
}
