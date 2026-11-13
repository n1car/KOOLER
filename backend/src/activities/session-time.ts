const SESSION_TIME_ZONE = 'America/Bogota';
const LOCAL_TIME_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: SESSION_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3,
  hourCycle: 'h23',
});

export function hasSessionEndElapsed(
  sessionDate: string | null | undefined,
  endTime: string | null | undefined,
  now: Date = new Date(),
): boolean {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(sessionDate ?? '');
  const timeMatch =
    /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(endTime ?? '');
  if (!dateMatch || !timeMatch) return false;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return false;
  }

  const [, hour, minute, second = '00'] = timeMatch;
  const sessionEnd = `${sessionDate}T${hour}:${minute}:${second}.000`;
  const localNowParts = Object.fromEntries(
    LOCAL_TIME_FORMATTER.formatToParts(now).map(({ type, value }) => [
      type,
      value,
    ]),
  );
  const localNow =
    `${localNowParts.year}-${localNowParts.month}-${localNowParts.day}` +
    `T${localNowParts.hour}:${localNowParts.minute}:${localNowParts.second}` +
    `.${localNowParts.fractionalSecond}`;

  return localNow >= sessionEnd;
}
