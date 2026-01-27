import { createDAVClient } from 'tsdav';

function stripWrappingQuotes(v: string): string {
	// Handles CALDAV_SERVER_URL='http://...' style values (keeps .env unchanged)
	const s = v.trim();
	if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
		return s.slice(1, -1);
	}
	return s;
}

function env(name: string): string {
	const v = process.env[name];
	if (!v) throw new Error(`Missing required env var: ${name}`);
	return stripWrappingQuotes(v);
}

export async function getDAVClient() {
	const serverUrl = env('CALDAV_SERVER_URL');
	const username = env('CALDAV_USERNAME');
	const password = env('CALDAV_PASSWORD');

	return createDAVClient({
		serverUrl,
		credentials: { username, password },
		authMethod: 'Basic',
		defaultAccountType: 'caldav',
	});
}

export async function getCalendars() {
	const client = await getDAVClient();
	return client.fetchCalendars();
}

export async function getCalendarObjects(args: { calendar: any; calendarObjectUrls?: string[] }) {
	const client = await getDAVClient();
	return client.fetchCalendarObjects({
		calendar: args.calendar,
		calendarObjectUrls: args.calendarObjectUrls,
	});
}
