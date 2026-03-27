import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

// Token expiration time in hours
const TOKEN_EXPIRATION_HOURS = 24;

/**
 * Generate a secure random token
 */
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

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

    // Create user without emailVerified (defaults to null)
    const user = await db.user.create({
      data: { name, email, password: hashedPassword, role: 'member', points: 50 },
    });

    // Create point history for welcome bonus
    await db.pointHistory.create({
      data: { userId: user.id, points: 50, reason: 'Welcome bonus!', type: 'bonus' },
    });

    // Generate verification token
    const token = generateVerificationToken();
    const expires = new Date(Date.now() + TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000);

    // Store the verification token
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Create verification link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationLink = `${appUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    // Send verification email (graceful fallback if RESEND_API_KEY not set)
    const emailResult = await sendEmail(email, 'emailVerification', {
      name: user.name || 'Friend',
      verificationLink,
    });

    if (!emailResult.success) {
      console.warn('Failed to send verification email:', emailResult.error);
      // Continue anyway - user can request resend
    }

    return NextResponse.json({ 
      user: { id: user.id, name: user.name, email: user.email },
      message: 'Account created! Please check your email to verify your account.',
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
