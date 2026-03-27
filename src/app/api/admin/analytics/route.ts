import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get analytics data in parallel
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      pendingPosts,
      totalEvents,
      upcomingEvents,
      totalCertificates,
      totalBadges,
      emailStats,
      recentRegistrations,
      topContributors,
      eventAttendance,
    ] = await Promise.all([
      // Total users
      db.user.count(),
      
      // Active users
      db.user.count({ where: { isActive: true } }),
      
      // Total posts
      db.post.count(),
      
      // Pending posts for moderation
      db.post.count({ where: { status: 'pending' } }),
      
      // Total events
      db.event.count(),
      
      // Upcoming events
      db.event.count({
        where: {
          startDate: { gte: now },
          status: 'upcoming',
        },
      }),
      
      // Total certificates
      db.certificate.count(),
      
      // Total badges awarded
      db.userBadge.count(),
      
      // Email stats
      db.emailLog.groupBy({
        by: ['status'],
        _count: true,
      }),
      
      // Recent registrations (last 30 days)
      db.user.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      
      // Top contributors
      db.user.findMany({
        where: { isActive: true },
        orderBy: { points: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          points: true,
          image: true,
        },
      }),
      
      // Event attendance stats
      db.rSVP.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    // Get user growth data (by month for last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    const userGrowth = await db.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count
      FROM User
      WHERE createdAt >= ${sixMonthsAgo.toISOString()}
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month ASC
    `;

    // Get event participation data
    const eventParticipation = await db.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count
      FROM RSVP
      WHERE createdAt >= ${sixMonthsAgo.toISOString()}
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month ASC
    `;

    // Format analytics response
    const analytics = {
      overview: {
        totalUsers,
        activeUsers,
        totalPosts,
        pendingPosts,
        totalEvents,
        upcomingEvents,
        totalCertificates,
        totalBadgesAwarded: totalBadges,
      },
      emailStats: {
        sent: emailStats.find((e) => e.status === 'sent')?._count || 0,
        failed: emailStats.find((e) => e.status === 'failed')?._count || 0,
        pending: emailStats.find((e) => e.status === 'pending')?._count || 0,
      },
      attendanceStats: {
        registered: eventAttendance.find((e) => e.status === 'registered')?._count || 0,
        attended: eventAttendance.find((e) => e.status === 'attended')?._count || 0,
        cancelled: eventAttendance.find((e) => e.status === 'cancelled')?._count || 0,
      },
      charts: {
        userGrowth: userGrowth.map((u) => ({
          month: u.month,
          count: Number(u.count),
        })),
        eventParticipation: eventParticipation.map((e) => ({
          month: e.month,
          count: Number(e.count),
        })),
      },
      recent: {
        registrations: recentRegistrations,
        topContributors,
      },
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
