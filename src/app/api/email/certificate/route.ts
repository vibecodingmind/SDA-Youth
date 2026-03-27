import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, certificateId } = body;

    if (!email || !certificateId) {
      return NextResponse.json(
        { error: 'Email and certificateId are required' },
        { status: 400 }
      );
    }

    // Get certificate details
    const certificate = await db.certificate.findUnique({
      where: { id: certificateId },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Send certificate email
    const result = await sendEmail(email, 'certificate', {
      name: name || certificate.issuedTo,
      certificateTitle: certificate.title,
      certificateId: certificate.certificateId,
    });

    // Log email
    await db.emailLog.create({
      data: {
        to: email,
        subject: `Congratulations! You've earned a certificate!`,
        type: 'certificate',
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

    return NextResponse.json({ success: true, message: 'Certificate email sent' });
  } catch (error) {
    console.error('Certificate email error:', error);
    return NextResponse.json(
      { error: 'Failed to send certificate email' },
      { status: 500 }
    );
  }
}
