import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// GET - Fetch onboarding status
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
        onboardingCompleted: true,
        onboardingStep: true,
        interests: true,
        notificationPrefs: true,
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
    console.error('Onboarding fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch onboarding data' }, { status: 500 });
  }
}

// POST - Save onboarding progress
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      step, 
      completed,
      name,
      phone,
      bio,
      image,
      timezone,
      interests,
      notificationPrefs,
    } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (step !== undefined) updateData.onboardingStep = step;
    if (completed !== undefined) updateData.onboardingCompleted = completed;
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

    // Award points for completing onboarding
    if (completed) {
      await db.pointHistory.create({
        data: {
          userId: session.user.id,
          points: 50,
          reason: 'Completed onboarding',
          type: 'bonus',
        },
      });

      await db.user.update({
        where: { id: session.user.id },
        data: { points: { increment: 50 } },
      });

      // Award "Welcome Bee" badge if it exists
      const welcomeBadge = await db.badge.findFirst({
        where: { name: { contains: 'Welcome' } },
      });

      if (welcomeBadge) {
        await db.userBadge.upsert({
          where: {
            userId_badgeId: {
              userId: session.user.id,
              badgeId: welcomeBadge.id,
            },
          },
          create: {
            userId: session.user.id,
            badgeId: welcomeBadge.id,
          },
          update: {},
        });
      }

      // Create notification
      await db.notification.create({
        data: {
          userId: session.user.id,
          title: 'Welcome to BUSYBEES! 🐝',
          message: 'You earned 50 points for completing your profile!',
          type: 'achievement',
        },
      });
    }

    return NextResponse.json({ 
      user: {
        ...user,
        interests: user.interests ? JSON.parse(user.interests) : null,
        notificationPrefs: user.notificationPrefs ? JSON.parse(user.notificationPrefs) : null,
      }
    });
  } catch (error) {
    console.error('Onboarding save error:', error);
    return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 });
  }
}
