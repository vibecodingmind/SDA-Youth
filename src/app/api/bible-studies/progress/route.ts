import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/bible-studies/progress - Get user's progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const bibleStudyId = searchParams.get('bibleStudyId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (bibleStudyId) {
      const progress = await db.bibleStudyProgress.findUnique({
        where: {
          bibleStudyId_userId: { bibleStudyId, userId },
        },
        include: {
          bibleStudy: {
            include: { sections: { orderBy: { order: 'asc' } } },
          },
        },
      });
      return NextResponse.json(progress);
    }

    // Get all progress for user
    const progressList = await db.bibleStudyProgress.findMany({
      where: { userId },
      include: {
        bibleStudy: {
          include: { _count: { select: { sections: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(progressList);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST /api/bible-studies/progress - Update progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bibleStudyId, userId, currentSection, isCompleted } = body;

    if (!bibleStudyId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: bibleStudyId, userId' },
        { status: 400 }
      );
    }

    // Get the bible study to know total sections
    const bibleStudy = await db.bibleStudy.findUnique({
      where: { id: bibleStudyId },
      include: { _count: { select: { sections: true } } },
    });

    if (!bibleStudy) {
      return NextResponse.json(
        { error: 'Bible study not found' },
        { status: 404 }
      );
    }

    const completed = isCompleted || currentSection >= bibleStudy._count.sections;

    const progress = await db.bibleStudyProgress.upsert({
      where: {
        bibleStudyId_userId: { bibleStudyId, userId },
      },
      update: {
        currentSection: currentSection ?? 0,
        isCompleted: completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        bibleStudyId,
        userId,
        currentSection: currentSection ?? 0,
        isCompleted: completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
