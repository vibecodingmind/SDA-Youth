import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Send welcome email
    const result = await sendEmail(email, 'welcome', { name: name || 'Friend' });

    // Log email
    await db.emailLog.create({
      data: {
        to: email,
        subject: 'Welcome to BUSYBEES SDA Youth Ministry!',
        type: 'welcome',
        status: result.success ? 'sent' : 'failed',
        error: result.error,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Welcome email sent' });
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}
