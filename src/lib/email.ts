import { Resend } from 'resend';

// Lazy-initialize Resend client only when needed
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email sending is disabled.');
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Email types
export type EmailTemplate = 'welcome' | 'eventReminder' | 'certificate' | 'passwordReset' | 'eventConfirmation';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  type: EmailTemplate;
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to BUSYBEES SDA Youth Ministry! 🐝',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🐝 Welcome to BUSYBEES!</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Welcome to the BUSYBEES SDA Youth Ministry community! We're so excited to have you join us on this journey of faith, fellowship, and growth.
          </p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #7C3AED; margin-top: 0;">Here's what you can do next:</h3>
            <ul style="color: #4b5563;">
              <li>📅 Check out upcoming events</li>
              <li>💬 Connect with other members in the community</li>
              <li>🏆 Earn badges and points through participation</li>
              <li>📜 Access resources and devotionals</li>
            </ul>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
             style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Go to Dashboard
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Blessings,<br>The BUSYBEES Team
          </p>
        </div>
      </div>
    `,
  }),

  eventReminder: (name: string, eventTitle: string, eventDate: string, eventLocation: string) => ({
    subject: `📅 Reminder: ${eventTitle} is coming up!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📅 Event Reminder</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            This is a friendly reminder that <strong>${eventTitle}</strong> is coming up soon!
          </p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 10px 0; color: #4b5563;">
              <strong>📅 Date:</strong> ${eventDate}
            </p>
            <p style="margin: 10px 0; color: #4b5563;">
              <strong>📍 Location:</strong> ${eventLocation}
            </p>
          </div>
          <p style="color: #4b5563;">
            We look forward to seeing you there! Don't forget to check in to earn your participation points.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/events" 
             style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Event Details
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Blessings,<br>The BUSYBEES Team
          </p>
        </div>
      </div>
    `,
  }),

  certificate: (name: string, certificateTitle: string, certificateId: string) => ({
    subject: `🎉 Congratulations! You've earned a certificate!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Certificate Earned!</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">Congratulations ${name}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            You have been awarded the <strong>${certificateTitle}</strong> certificate! This is a testament to your dedication and commitment.
          </p>
          <div style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; border: 2px solid #7C3AED;">
            <h3 style="color: #7C3AED; margin: 0;">📜 ${certificateTitle}</h3>
            <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">Certificate ID: ${certificateId}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/certificates" 
             style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Certificate
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Keep up the great work!<br>The BUSYBEES Team
          </p>
        </div>
      </div>
    `,
  }),

  passwordReset: (name: string, resetLink: string) => ({
    subject: '🔐 Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <a href="${resetLink}" 
             style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            The BUSYBEES Team
          </p>
        </div>
      </div>
    `,
  }),

  eventConfirmation: (name: string, eventTitle: string, eventDate: string, eventLocation: string) => ({
    subject: `✅ RSVP Confirmed: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ RSVP Confirmed!</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">Great, ${name}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your RSVP for <strong>${eventTitle}</strong> has been confirmed. We're excited to see you there!
          </p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 10px 0; color: #4b5563;">
              <strong>📅 Date:</strong> ${eventDate}
            </p>
            <p style="margin: 10px 0; color: #4b5563;">
              <strong>📍 Location:</strong> ${eventLocation}
            </p>
            <p style="margin: 10px 0; color: #7C3AED;">
              <strong>🏆 Points:</strong> You'll earn points for attending!
            </p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/events" 
             style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Event Details
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Blessings,<br>The BUSYBEES Team
          </p>
        </div>
      </div>
    `,
  }),
};

// Send email function
export async function sendEmail(
  to: string,
  type: EmailTemplate,
  data: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    
    if (!resend) {
      console.log(`Email sending skipped (no API key): ${type} to ${to}`);
      return { success: true }; // Return success to not block flows
    }

    let template;
    let subject: string;

    switch (type) {
      case 'welcome':
        template = emailTemplates.welcome(data.name || 'Friend');
        break;
      case 'eventReminder':
        template = emailTemplates.eventReminder(
          data.name || 'Friend',
          data.eventTitle || 'Event',
          data.eventDate || 'TBD',
          data.eventLocation || 'TBD'
        );
        break;
      case 'certificate':
        template = emailTemplates.certificate(
          data.name || 'Friend',
          data.certificateTitle || 'Certificate',
          data.certificateId || ''
        );
        break;
      case 'passwordReset':
        template = emailTemplates.passwordReset(
          data.name || 'Friend',
          data.resetLink || ''
        );
        break;
      case 'eventConfirmation':
        template = emailTemplates.eventConfirmation(
          data.name || 'Friend',
          data.eventTitle || 'Event',
          data.eventDate || 'TBD',
          data.eventLocation || 'TBD'
        );
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    subject = template.subject;

    const { data: result, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'BUSYBEES <noreply@busybees.church>',
      to,
      subject,
      html: template.html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: String(error) };
  }
}

export { getResendClient };
