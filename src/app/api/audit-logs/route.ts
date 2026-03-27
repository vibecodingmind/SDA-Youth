import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get audit logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      db.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

// Create audit log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, entity, entityId, details, ipAddress, userAgent } = body;

    const log = await db.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Audit log creation error:', error);
    return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 });
  }
}
