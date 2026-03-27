import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  generateICSFile,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  generateYahooCalendarUrl,
  generateAllCalendarLinks,
  getICSDownloadHeaders,
} from '@/lib/calendar';

// GET /api/events/[id]/calendar - Get calendar links for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { download } = Object.fromEntries(request.nextUrl.searchParams);

    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: { name: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // If download is requested, return ICS file
    if (download === 'ics') {
      const icsContent = generateICSFile(event);
      const filename = `busybees-event-${event.title.toLowerCase().replace(/\s+/g, '-')}`;

      return new NextResponse(icsContent, {
        headers: getICSDownloadHeaders(filename),
      });
    }

    // Return all calendar links
    const links = generateAllCalendarLinks(event);

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
      },
      links: {
        google: links.google,
        outlook: links.outlook,
        yahoo: links.yahoo,
        icsDownload: `/api/events/${eventId}/calendar?download=ics`,
      },
    });
  } catch (error) {
    console.error('Error generating calendar links:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar links' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/calendar - Generate specific calendar format
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { format = 'google' } = body;

    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: { name: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    switch (format) {
      case 'google':
        return NextResponse.json({
          url: generateGoogleCalendarUrl(event),
        });
      case 'outlook':
        return NextResponse.json({
          url: generateOutlookCalendarUrl(event),
        });
      case 'yahoo':
        return NextResponse.json({
          url: generateYahooCalendarUrl(event),
        });
      case 'ics':
        return NextResponse.json({
          content: generateICSFile(event),
        });
      default:
        return NextResponse.json(
          { error: 'Invalid format. Use: google, outlook, yahoo, or ics' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error generating calendar link:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar link' },
      { status: 500 }
    );
  }
}
