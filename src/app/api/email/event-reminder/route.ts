import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, eventId } = body;

    if (!email || !eventId) {
      return NextResponse.json(
        { error: 'Email and eventId are required' },
        { status: 400 }
      );
    }

    // Get event details
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventDate = new Date(event.startDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Send event reminder email
    const result = await sendEmail(email, 'eventReminder', {
      name: name || 'Friend',
      eventTitle: event.title,
      eventDate,
      eventLocation: event.location || 'TBD',
    });

    // Log email
    await db.emailLog.create({
      data: {
        to: email,
        subject: `Reminder: ${event.title} is coming up!`,
        type: 'eventReminder',
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

    return NextResponse.json({ success: true, message: 'Event reminder sent' });
  } catch (error) {
    console.error('Event reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to send event reminder' },
      { status: 500 }
    );
  }
}
