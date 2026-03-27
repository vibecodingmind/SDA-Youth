import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      include: {
        posts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        events: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        certificates: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        badges: {
          include: {
            badge: true,
          },
        },
        pointHistory: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            posts: true,
            comments: true,
            events: true,
            rsvps: true,
            badges: true,
            certificates: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, role, isActive, points } = body;

    const user = await db.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(points !== undefined && { points }),
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
