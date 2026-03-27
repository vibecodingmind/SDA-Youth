import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, message, recipients } = body;

    if (!subject || !message || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'Subject, message, and recipients are required' },
        { status: 400 }
      );
    }

    const results = {
      total: recipients.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send emails in batches of 10
    for (let i = 0; i < recipients.length; i += 10) {
      const batch = recipients.slice(i, i + 10);
      
      await Promise.all(
        batch.map(async (recipient: { email: string; name?: string }) => {
          try {
            const html = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
                <div style="background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">🐝 BUSYBEES</h1>
                </div>
                <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <h2 style="color: #1f2937; margin-top: 0;">Hello ${recipient.name || 'Friend'},</h2>
                  <div style="color: #4b5563; line-height: 1.6;">
                    ${message}
                  </div>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Blessings,<br>The BUSYBEES Team
                  </p>
                </div>
              </div>
            `;

            const { error } = await resend.emails.send({
              from: process.env.EMAIL_FROM || 'BUSYBEES <noreply@busybees.church>',
              to: recipient.email,
              subject,
              html,
            });

            if (error) {
              results.failed++;
              results.errors.push(`${recipient.email}: ${error.message}`);
            } else {
              results.sent++;
            }

            // Log email
            await db.emailLog.create({
              data: {
                to: recipient.email,
                subject,
                type: 'bulk',
                status: error ? 'failed' : 'sent',
                error: error?.message,
              },
            });
          } catch (error) {
            results.failed++;
            results.errors.push(`${recipient.email}: ${String(error)}`);
          }
        })
      );
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Bulk email error:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk emails' },
      { status: 500 }
    );
  }
}
