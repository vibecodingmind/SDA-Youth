import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/devotionals/reading - Get user's reading progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const devotionalId = searchParams.get('devotionalId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (devotionalId) {
      // Get specific reading progress
      const reading = await db.devotionalReading.findUnique({
        where: {
          devotionalId_userId: { devotionalId, userId },
        },
        include: { devotional: true },
      });
      return NextResponse.json(reading);
    }

    // Get all reading progress for user
    const readings = await db.devotionalReading.findMany({
      where: { userId },
      include: { devotional: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(readings);
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reading progress' },
      { status: 500 }
    );
  }
}

// POST /api/devotionals/reading - Mark devotional as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { devotionalId, userId, isCompleted = true, notes } = body;

    if (!devotionalId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: devotionalId, userId' },
        { status: 400 }
      );
    }

    const reading = await db.devotionalReading.upsert({
      where: {
        devotionalId_userId: { devotionalId, userId },
      },
      update: {
        isCompleted,
        notes,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        devotionalId,
        userId,
        isCompleted,
        notes,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return NextResponse.json(reading);
  } catch (error) {
    console.error('Error updating reading progress:', error);
    return NextResponse.json(
      { error: 'Failed to update reading progress' },
      { status: 500 }
    );
  }
}
