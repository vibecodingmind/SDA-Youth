import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    const where = name ? { name: { contains: name } } : {};

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        points: true,
        streak: true,
        isActive: true,
        createdAt: true,
        badges: { include: { badge: { select: { name: true, icon: true } } } },
      },
      orderBy: { points: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, points, isActive, badges } = body;

    const user = await db.user.create({
      data: {
        name,
        email,
        role: role || 'member',
        points: points || 0,
        isActive: isActive ?? true,
      },
    });

    if (badges && Array.isArray(badges)) {
      for (const badgeId of badges) {
        await db.userBadge.create({
          data: { userId: user.id, badgeId },
        });
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
