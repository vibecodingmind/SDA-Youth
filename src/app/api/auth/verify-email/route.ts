import { NextRequest, NextResponse } from 'next/server';
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

/**
 * POST /api/auth/verify-email
 * Send a verification email to the user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, a verification email has been sent.' 
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email is already verified.' 
      });
    }

    // Delete any existing verification tokens for this email
    await db.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Generate new token
    const token = generateVerificationToken();
    const expires = new Date(Date.now() + TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000);

    // Store the token
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

    // Send verification email
    const emailResult = await sendEmail(email, 'emailVerification', {
      name: user.name || 'Friend',
      verificationLink,
    });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Still return success to not reveal email existence
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, a verification email has been sent.' 
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}

/**
 * GET /api/auth/verify-email?token=xxx&email=xxx
 * Verify email with token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(
        new URL('/auth/verify?error=invalid-token', request.url)
      );
    }

    // Find the verification token
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL('/auth/verify?error=invalid-token', request.url)
      );
    }

    // Check if token matches email
    if (verificationToken.identifier !== email) {
      return NextResponse.redirect(
        new URL('/auth/verify?error=invalid-token', request.url)
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(
        new URL('/auth/verify?error=token-expired', request.url)
      );
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL('/auth/verify?error=user-not-found', request.url)
      );
    }

    // Update user as verified
    await db.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Delete the used token
    await db.verificationToken.delete({ where: { token } });

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/auth/verify?success=true', request.url)
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      new URL('/auth/verify?error=verification-failed', request.url)
    );
  }
}
