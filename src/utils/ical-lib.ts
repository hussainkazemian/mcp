import { DateTime } from 'luxon';

export type ICalInput = {
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  uid?: string;
  domain?: string;
  timezone?: string;
};

/**
 * Escape special characters for iCal (RFC 5545) text values.
 * - Backslash, comma, semicolon are escaped with backslash
 * - Newlines are converted to literal \n
 */
const escapeText = (str: string): string =>
  str.replace(/[\\,;]/g, (match) => `\\${match}`).replace(/\n/g, '\\n');

/**
 * Format a Date as iCal timestamp.
 * If timezone is provided, outputs as TZID=timezone:YYYYMMDDTHHMMSS
 * Otherwise, outputs UTC: YYYYMMDDTHHMMSSZ
 */
const toCalDav = (date: Date, timezone?: string): string => {
  if (timezone) {
    return DateTime.fromJSDate(date).setZone(timezone).toFormat("yyyyMMdd'T'HHmmss");
  } else {
    return DateTime.fromJSDate(date).toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
  }
};

/**
 * Generate an iCal formatted string from the given input.
 *
 * @param input object containing event details
 * @returns iCal formatted string
 *
 */

const generateICal = (input: ICalInput): string => {
  const {
    title,
    start,
    end,
    description,
    location,
    uid,
    domain = 'example-domain.com',
    timezone = 'Europe/Helsinki',
  } = input;

  const finalUid = uid || `${crypto.randomUUID()}@${domain}`;
  const now = toCalDav(new Date()); // DTSTAMP in UTC

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Standardized ICal Lib//EN',
    'CALSCALE:GREGORIAN',
  ];

  // Add VTIMEZONE if timezone is specified
  if (timezone) {
    lines.push(
      'BEGIN:VTIMEZONE',
      `TZID:${timezone}`,
      'BEGIN:STANDARD',
      'DTSTART:20231029T030000',
      'TZOFFSETFROM:+0300',
      'TZOFFSETTO:+0200',
      'TZNAME:EET',
      'END:STANDARD',
      'BEGIN:DAYLIGHT',
      'DTSTART:20240331T030000',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0300',
      'TZNAME:EEST',
      'END:DAYLIGHT',
      'END:VTIMEZONE'
    );
  }

  lines.push(
    'BEGIN:VEVENT',
    `UID:${finalUid}`,
    `DTSTAMP:${now}`,
    `DTSTART${timezone ? `;TZID=${timezone}` : ''}:${toCalDav(start, timezone)}`,
    `DTEND${timezone ? `;TZID=${timezone}` : ''}:${toCalDav(end, timezone)}`,
    `SUMMARY:${escapeText(title)}`,
  );

  if (description) {
    lines.push(`DESCRIPTION:${escapeText(description)}`);
  }
  if (location) {
    lines.push(`LOCATION:${escapeText(location)}`);
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  // Join with CRLF as required by RFC 5545
  return lines.join('\r\n');
};

export { generateICal };