import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { confirm } = body;

    if (confirm !== 'SEED_DATA_CONFIRM') {
      return NextResponse.json({ error: 'Confirmation required' }, { status: 400 });
    }

    // Create admin user
    const adminPassword = await hash('admin123', 12);
    const admin = await db.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@busybees.church',
        password: adminPassword,
        role: 'admin',
        points: 1000,
      },
    });

    // Create sample members
    const memberPassword = await hash('member123', 12);
    const members = await Promise.all([
      db.user.create({
        data: { name: 'Sarah Kim', email: 'sarah@busybees.church', password: memberPassword, role: 'leader', points: 1200, streak: 15 },
      }),
      db.user.create({
        data: { name: 'Mike Chen', email: 'mike@busybees.church', password: memberPassword, role: 'leader', points: 980, streak: 8 },
      }),
      db.user.create({
        data: { name: 'Emma Wilson', email: 'emma@busybees.church', password: memberPassword, points: 850, streak: 5 },
      }),
      db.user.create({
        data: { name: 'David Park', email: 'david@busybees.church', password: memberPassword, points: 600, streak: 3 },
      }),
      db.user.create({
        data: { name: 'Lisa Brown', email: 'lisa@busybees.church', password: memberPassword, points: 380, streak: 2 },
      }),
    ]);

    // Create badges
    const badges = await Promise.all([
      db.badge.create({ data: { name: 'First Steps', description: 'Complete your first event', icon: '🎯', points: 10, category: 'attendance' } }),
      db.badge.create({ data: { name: 'Social Butterfly', description: 'Attend 5 events', icon: '🦋', points: 25, category: 'attendance' } }),
      db.badge.create({ data: { name: 'Helper', description: 'Volunteer for 3 activities', icon: '🤝', points: 30, category: 'contribution' } }),
      db.badge.create({ data: { name: 'Top Contributor', description: 'Reach top 10 on leaderboard', icon: '⭐', points: 50, category: 'contribution' } }),
      db.badge.create({ data: { name: 'Event Master', description: 'Create 5 events', icon: '🎉', points: 75, category: 'leadership' } }),
      db.badge.create({ data: { name: 'Mentor', description: 'Help 10 new members', icon: '📖', points: 100, category: 'leadership' } }),
      db.badge.create({ data: { name: 'Prayer Warrior', description: 'Pray for 50 requests', icon: '🙏', points: 40, category: 'spiritual' } }),
      db.badge.create({ data: { name: 'Bible Scholar', description: 'Complete 30 devotionals', icon: '📚', points: 60, category: 'spiritual' } }),
    ]);

    // Award some badges
    await Promise.all([
      db.userBadge.create({ data: { userId: members[0].id, badgeId: badges[0].id } }),
      db.userBadge.create({ data: { userId: members[0].id, badgeId: badges[1].id } }),
      db.userBadge.create({ data: { userId: members[0].id, badgeId: badges[3].id } }),
      db.userBadge.create({ data: { userId: members[1].id, badgeId: badges[0].id } }),
      db.userBadge.create({ data: { userId: members[1].id, badgeId: badges[2].id } }),
      db.userBadge.create({ data: { userId: members[2].id, badgeId: badges[0].id } }),
    ]);

    // Create events
    const events = await Promise.all([
      db.event.create({
        data: {
          title: 'Youth Bible Study',
          description: 'Weekly Bible study for all youth members',
          location: 'Main Hall',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          points: 10,
          creatorId: admin.id,
        },
      }),
      db.event.create({
        data: {
          title: 'Community Service Day',
          description: 'Join us for a day of serving our community',
          location: 'City Park',
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          points: 25,
          creatorId: members[0].id,
        },
      }),
      db.event.create({
        data: {
          title: 'Worship Night',
          description: 'An evening of praise and worship',
          location: 'Sanctuary',
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          points: 15,
          creatorId: members[1].id,
        },
      }),
      db.event.create({
        data: {
          title: 'Youth Retreat',
          description: 'Annual youth retreat - 3 days of fellowship',
          location: 'Mountain Camp',
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
          points: 100,
          creatorId: admin.id,
        },
      }),
    ]);

    // Create devotionals
    const devotionals = await Promise.all([
      db.devotional.create({
        data: {
          title: 'Walking by Faith',
          content: 'Faith is the substance of things hoped for, the evidence of things not seen. Today, let us walk by faith and not by sight, trusting in God\'s perfect plan for our lives.',
          scripture: '2 Corinthians 5:7',
          verse: 'For we walk by faith, not by sight.',
          author: 'Pastor John',
          date: new Date(),
        },
      }),
      db.devotional.create({
        data: {
          title: 'The Power of Prayer',
          content: 'Prayer is our direct line of communication with God. Through prayer, we express our gratitude, seek guidance, and find peace in His presence.',
          scripture: 'James 5:16',
          verse: 'The prayer of a righteous person is powerful and effective.',
          author: 'Pastor John',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      }),
      db.devotional.create({
        data: {
          title: 'Trusting God\'s Timing',
          content: 'God\'s timing is perfect. When we feel impatient, let us remember that He is working all things together for our good.',
          scripture: 'Ecclesiastes 3:11',
          verse: 'He has made everything beautiful in its time.',
          author: 'Sarah Kim',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    // Create daily challenges
    await Promise.all([
      db.dailyChallenge.create({
        data: {
          title: 'Read 1 Bible chapter',
          description: 'Spend time in God\'s Word today',
          points: 10,
          type: 'read_bible',
          date: new Date(),
        },
      }),
      db.dailyChallenge.create({
        data: {
          title: 'Pray for 10 minutes',
          description: 'Connect with God through prayer',
          points: 15,
          type: 'pray',
          date: new Date(),
        },
      }),
      db.dailyChallenge.create({
        data: {
          title: 'Share a verse with a friend',
          description: 'Spread God\'s Word to others',
          points: 20,
          type: 'share',
          date: new Date(),
        },
      }),
    ]);

    // Create rewards
    await Promise.all([
      db.reward.create({ data: { name: 'Snack Bar Voucher', points: 50, image: '🍫', stock: 20 } }),
      db.reward.create({ data: { name: 'Youth T-Shirt', points: 200, image: '👕', stock: 10 } }),
      db.reward.create({ data: { name: 'Bookstore Gift Card ($10)', points: 300, image: '📚', stock: 5 } }),
      db.reward.create({ data: { name: 'Movie Ticket', points: 150, image: '🎬', stock: 8 } }),
      db.reward.create({ data: { name: 'Special Event Discount', points: 100, image: '🎟️', stock: 15 } }),
    ]);

    // Create small groups
    await Promise.all([
      db.smallGroup.create({
        data: {
          name: 'Young Adults',
          description: 'For ages 18-25',
          leaderId: members[0].id,
          capacity: 20,
          meetingTime: 'Wednesday 7:00 PM',
          location: 'Room 201',
          members: { create: [{ userId: members[0].id, role: 'leader' }, { userId: members[2].id }] },
        },
      }),
      db.smallGroup.create({
        data: {
          name: 'High School',
          description: 'For high school students',
          leaderId: members[1].id,
          capacity: 25,
          meetingTime: 'Friday 6:00 PM',
          location: 'Youth Room',
          members: { create: [{ userId: members[1].id, role: 'leader' }, { userId: members[3].id }] },
        },
      }),
    ]);

    // Create chat rooms
    await Promise.all([
      db.chatRoom.create({
        data: {
          name: 'General Chat',
          description: 'General discussion for all members',
          type: 'group',
          createdBy: admin.id,
          members: {
            create: [
              { userId: admin.id, role: 'admin' },
              { userId: members[0].id },
              { userId: members[1].id },
            ],
          },
        },
      }),
      db.chatRoom.create({
        data: {
          name: 'Bible Study Group',
          description: 'Discuss Bible passages and studies',
          type: 'group',
          createdBy: members[0].id,
          members: { create: [{ userId: members[0].id, role: 'admin' }, { userId: members[2].id }] },
        },
      }),
    ]);

    // Create prayer requests
    await Promise.all([
      db.prayerRequest.create({
        data: {
          authorId: members[0].id,
          title: 'Healing for grandmother',
          content: 'Please pray for my grandmother who is recovering from surgery.',
          status: 'active',
        },
      }),
      db.prayerRequest.create({
        data: {
          authorId: members[1].id,
          title: 'Guidance for career decision',
          content: 'I need wisdom for an important career decision coming up.',
          isAnonymous: true,
          status: 'active',
        },
      }),
      db.prayerRequest.create({
        data: {
          authorId: members[2].id,
          title: 'Mission trip preparation',
          content: 'Pray for our team as we prepare for our mission trip next month.',
          status: 'active',
        },
      }),
    ]);

    // Create forum categories and topics
    const category = await db.forumCategory.create({
      data: {
        name: 'Spiritual Growth',
        description: 'Discuss your spiritual journey',
        icon: '🌱',
      },
    });

    await db.forumTopic.create({
      data: {
        categoryId: category.id,
        authorId: members[0].id,
        title: 'How to stay consistent with devotions?',
        content: 'I struggle with maintaining a consistent devotional life. What tips do you have?',
      },
    });

    // Create daily verse
    await db.dailyVerse.create({
      data: {
        verse: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.',
        reference: 'Jeremiah 29:11',
        date: new Date(),
      },
    });

    // Create settings
    await Promise.all([
      db.setting.create({ data: { key: 'church_name', value: 'BUSYBEES SDA Youth Ministry', type: 'string' } }),
      db.setting.create({ data: { key: 'setup_complete', value: 'true', type: 'boolean' } }),
      db.setting.create({ data: { key: 'points_per_event', value: '10', type: 'number' } }),
      db.setting.create({ data: { key: 'points_per_devotional', value: '5', type: 'number' } }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: members.length + 1,
        badges: badges.length,
        events: events.length,
        devotionals: devotionals.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
