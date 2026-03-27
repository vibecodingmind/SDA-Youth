import { Event } from '@prisma/client';

/**
 * Format date for iCal (YYYYMMDDTHHMMSSZ)
 */
function formatDateForICal(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Format date for Google Calendar URL
 */
function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generate a unique ID for iCal events
 */
function generateUID(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}@busybees.org`;
}

/**
 * Escape special characters for iCal format
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

/**
 * Generate iCal/ICS content for a single event
 */
export function generateICSFile(event: Event & { creator?: { name?: string | null } }): string {
  const uid = generateUID();
  const dtstamp = formatDateForICal(new Date());
  const dtstart = formatDateForICal(event.startDate);
  const dtend = event.endDate ? formatDateForICal(event.endDate) : formatDateForICal(new Date(event.startDate.getTime() + 3600000)); // Default 1 hour if no end date
  
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BUSYBEES SDA Youth Ministry//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:BUSYBEES Events',
    'X-WR-TIMEZONE:UTC',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICalText(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICalText(event.location)}`);
  }

  if (event.image) {
    lines.push(`ATTACH:${event.image}`);
  }

  // Add organizer if available
  if (event.creator?.name) {
    lines.push(`ORGANIZER;CN=${escapeICalText(event.creator.name)}:mailto:noreply@busybees.org`);
  }

  // Add status
  if (event.status === 'cancelled') {
    lines.push('STATUS:CANCELLED');
  } else if (event.status === 'completed') {
    lines.push('STATUS:CONFIRMED');
  }

  // Add recurrence rule if recurring
  if (event.isRecurring && event.recurrenceType) {
    lines.push(generateRecurrenceRule(event));
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Generate iCal content for multiple events
 */
export function generateICSForEvents(events: Array<Event & { creator?: { name?: string | null } }>): string {
  const dtstamp = formatDateForICal(new Date());
  const eventsContent = events.map(event => {
    const uid = generateUID();
    const dtstart = formatDateForICal(event.startDate);
    const dtend = event.endDate ? formatDateForICal(event.endDate) : formatDateForICal(new Date(event.startDate.getTime() + 3600000));

    const lines: string[] = [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${escapeICalText(event.title)}`,
    ];

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
    }

    if (event.location) {
      lines.push(`LOCATION:${escapeICalText(event.location)}`);
    }

    lines.push('END:VEVENT');
    return lines.join('\r\n');
  }).join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BUSYBEES SDA Youth Ministry//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:BUSYBEES Events',
    'X-WR-TIMEZONE:UTC',
    eventsContent,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generate recurrence rule for iCal
 */
function generateRecurrenceRule(event: Event): string {
  if (!event.recurrenceType) return '';

  const parts: string[] = ['RRULE:'];

  switch (event.recurrenceType) {
    case 'daily':
      parts.push('FREQ=DAILY');
      break;
    case 'weekly':
      parts.push('FREQ=WEEKLY');
      if (event.recurrenceDays) {
        const days = event.recurrenceDays.split(',').map(d => {
          const dayMap: Record<string, string> = {
            '0': 'SU', '1': 'MO', '2': 'TU', '3': 'WE',
            '4': 'TH', '5': 'FR', '6': 'SA'
          };
          return dayMap[d] || d;
        });
        parts.push(`BYDAY=${days.join(',')}`);
      }
      break;
    case 'monthly':
      parts.push('FREQ=MONTHLY');
      break;
    case 'yearly':
      parts.push('FREQ=YEARLY');
      break;
    default:
      return '';
  }

  if (event.recurrenceEnd) {
    parts.push(`UNTIL=${formatDateForICal(event.recurrenceEnd)}`);
  } else if (event.recurrenceCount) {
    parts.push(`COUNT=${event.recurrenceCount}`);
  }

  return parts.join(';');
}

/**
 * Generate Google Calendar add event URL
 */
export function generateGoogleCalendarUrl(event: Event): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams();

  params.append('action', 'TEMPLATE');
  params.append('text', event.title);

  const startDate = formatDateForGoogle(event.startDate);
  const endDate = event.endDate 
    ? formatDateForGoogle(event.endDate)
    : formatDateForGoogle(new Date(event.startDate.getTime() + 3600000));

  params.append('dates', `${startDate}/${endDate}`);

  if (event.description) {
    params.append('details', event.description);
  }

  if (event.location) {
    params.append('location', event.location);
  }

  // Add recurrence if applicable
  if (event.isRecurring && event.recurrenceType) {
    const recurParams = generateGoogleRecurrence(event);
    if (recurParams) {
      params.append('recur', recurParams);
    }
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate Google Calendar recurrence string
 */
function generateGoogleRecurrence(event: Event): string {
  if (!event.recurrenceType) return '';

  const parts: string[] = ['RRULE:'];

  switch (event.recurrenceType) {
    case 'daily':
      parts.push('FREQ=DAILY');
      break;
    case 'weekly':
      parts.push('FREQ=WEEKLY');
      if (event.recurrenceDays) {
        const days = event.recurrenceDays.split(',').map(d => {
          const dayMap: Record<string, string> = {
            '0': 'SU', '1': 'MO', '2': 'TU', '3': 'WE',
            '4': 'TH', '5': 'FR', '6': 'SA'
          };
          return dayMap[d] || d;
        });
        parts.push(`BYDAY=${days.join(',')}`);
      }
      break;
    case 'monthly':
      parts.push('FREQ=MONTHLY');
      break;
    case 'yearly':
      parts.push('FREQ=YEARLY');
      break;
    default:
      return '';
  }

  if (event.recurrenceEnd) {
    parts.push(`UNTIL=${formatDateForGoogle(event.recurrenceEnd)}`);
  } else if (event.recurrenceCount) {
    parts.push(`COUNT=${event.recurrenceCount}`);
  }

  return parts.join(';');
}

/**
 * Generate Outlook Calendar add event URL
 */
export function generateOutlookCalendarUrl(event: Event): string {
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
  const params = new URLSearchParams();

  params.append('subject', event.title);

  const startDate = event.startDate.toISOString();
  const endDate = event.endDate 
    ? event.endDate.toISOString()
    : new Date(event.startDate.getTime() + 3600000).toISOString();

  params.append('startdt', startDate);
  params.append('enddt', endDate);

  if (event.description) {
    params.append('body', event.description);
  }

  if (event.location) {
    params.append('location', event.location);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate Yahoo Calendar add event URL
 */
export function generateYahooCalendarUrl(event: Event): string {
  const baseUrl = 'https://calendar.yahoo.com/';
  const params = new URLSearchParams();

  params.append('v', '60');
  params.append('title', event.title);

  const startDate = formatDateForGoogle(event.startDate);
  const endDate = event.endDate 
    ? formatDateForGoogle(event.endDate)
    : formatDateForGoogle(new Date(event.startDate.getTime() + 3600000));

  params.append('st', startDate);
  params.append('et', endDate);

  if (event.description) {
    params.append('desc', event.description);
  }

  if (event.location) {
    params.append('in_loc', event.location);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Download ICS file (returns response headers for download)
 */
export function getICSDownloadHeaders(filename: string): Record<string, string> {
  return {
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}.ics"`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

/**
 * Generate calendar links for all providers
 */
export function generateAllCalendarLinks(event: Event): {
  google: string;
  outlook: string;
  yahoo: string;
  ics: string;
} {
  return {
    google: generateGoogleCalendarUrl(event),
    outlook: generateOutlookCalendarUrl(event),
    yahoo: generateYahooCalendarUrl(event),
    ics: generateICSFile(event),
  };
}
