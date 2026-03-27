import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await db.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, markAllRead, userId } = body;

    if (markAllRead && userId) {
      await db.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required' },
        { status: 400 }
      );
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
