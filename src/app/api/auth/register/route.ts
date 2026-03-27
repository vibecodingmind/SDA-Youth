import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    const user = await db.user.create({
      data: { name, email, password: hashedPassword, role: 'member', points: 50 },
    });

    await db.pointHistory.create({
      data: { userId: user.id, points: 50, reason: 'Welcome bonus!', type: 'bonus' },
    });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
