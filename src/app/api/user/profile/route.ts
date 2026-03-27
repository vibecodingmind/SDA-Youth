import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// GET - Fetch user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        bio: true,
        timezone: true,
        role: true,
        points: true,
        streak: true,
        maxStreak: true,
        onboardingCompleted: true,
        onboardingStep: true,
        interests: true,
        notificationPrefs: true,
        createdAt: true,
        badges: {
          include: {
            badge: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                category: true,
              },
            },
          },
          orderBy: { earnedAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse JSON fields
    const userData = {
      ...user,
      interests: user.interests ? JSON.parse(user.interests) : null,
      notificationPrefs: user.notificationPrefs ? JSON.parse(user.notificationPrefs) : null,
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, bio, image, timezone, interests, notificationPrefs } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (image !== undefined) updateData.image = image;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (interests !== undefined) updateData.interests = JSON.stringify(interests);
    if (notificationPrefs !== undefined) updateData.notificationPrefs = JSON.stringify(notificationPrefs);

    const user = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        bio: true,
        timezone: true,
        onboardingCompleted: true,
        onboardingStep: true,
        interests: true,
        notificationPrefs: true,
      },
    });

    return NextResponse.json({ 
      user: {
        ...user,
        interests: user.interests ? JSON.parse(user.interests) : null,
        notificationPrefs: user.notificationPrefs ? JSON.parse(user.notificationPrefs) : null,
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
