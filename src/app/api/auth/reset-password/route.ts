import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ success: true }); // Don't reveal user existence

    const token = randomBytes(32).toString('hex');
    await db.setting.upsert({
      where: { key: `reset_${token}` },
      create: { key: `reset_${token}`, value: user.id, type: 'string' },
      update: { value: user.id },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    console.log('Password reset link:', resetLink);

    return NextResponse.json({ success: true, resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) return NextResponse.json({ error: 'Token and password required' }, { status: 400 });

    const storedToken = await db.setting.findUnique({ where: { key: `reset_${token}` } });
    if (!storedToken) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });

    const hashedPassword = await hash(password, 12);
    await db.user.update({ where: { id: storedToken.value }, data: { password: hashedPassword } });
    await db.setting.delete({ where: { key: `reset_${token}` } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
