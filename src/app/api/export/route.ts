import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const type = searchParams.get('type'); // users, events, etc.

    let data: Record<string, unknown> = {};

    switch (type) {
      case 'users':
        data.users = await db.user.findMany({
          select: { id: true, name: true, email: true, role: true, points: true, createdAt: true },
        });
        break;
      case 'events':
        data.events = await db.event.findMany({
          include: { _count: { select: { rsvps: true, checkIns: true } } },
        });
        break;
      case 'attendance':
        data.checkIns = await db.checkIn.findMany({
          include: { user: { select: { name: true } }, event: { select: { title: true } } },
        });
        break;
      case 'leaderboard':
        data.leaderboard = await db.user.findMany({
          orderBy: { points: 'desc' },
          select: { name: true, points: true, streak: true },
        });
        break;
      default:
        // Export all data summary
        data = {
          summary: {
            totalUsers: await db.user.count(),
            totalEvents: await db.event.count(),
            totalCheckIns: await db.checkIn.count(),
            totalBadges: await db.badge.count(),
            totalPoints: (await db.user.aggregate({ _sum: { points: true } }))._sum.points || 0,
          },
          users: await db.user.findMany({
            select: { name: true, email: true, role: true, points: true },
            orderBy: { points: 'desc' },
          }),
          events: await db.event.findMany({
            select: { title: true, startDate: true, location: true },
            orderBy: { startDate: 'desc' },
            take: 20,
          }),
        };
    }

    if (format === 'csv') {
      // Convert to CSV
      const csvData = convertToCSV(data);
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type || 'export'}-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

function convertToCSV(data: Record<string, unknown>): string {
  const keys = Object.keys(data);
  if (keys.length === 0) return '';

  const firstKey = keys[0];
  const array = data[firstKey];
  if (!Array.isArray(array) || array.length === 0) return '';

  const headers = Object.keys(array[0]);
  const rows = array.map((item: Record<string, unknown>) =>
    headers.map((h) => {
      const value = item[h];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return String(value ?? '');
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
