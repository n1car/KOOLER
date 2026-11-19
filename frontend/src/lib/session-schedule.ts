export function generateSessionDates(
  startDate: string,
  weekdays: number[],
  sessionCount: number,
  durationWeeks: number,
): string[] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate);
  if (
    !match ||
    !Number.isInteger(sessionCount) ||
    sessionCount < 1 ||
    !Number.isInteger(durationWeeks) ||
    durationWeeks < 1
  ) {
    return [];
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const start = new Date(Date.UTC(year, month - 1, day));
  if (
    start.getUTCFullYear() !== year ||
    start.getUTCMonth() !== month - 1 ||
    start.getUTCDate() !== day
  ) {
    return [];
  }

  const selectedWeekdays = new Set(
    weekdays.filter((weekday) => Number.isInteger(weekday) && weekday >= 0 && weekday <= 6),
  );
  if (selectedWeekdays.size === 0) return [];

  const dates: string[] = [];
  const durationDays = durationWeeks * 7;
  for (let offset = 0; offset < durationDays && dates.length < sessionCount; offset += 1) {
    const date = new Date(start.getTime() + offset * 24 * 60 * 60 * 1000);
    if (selectedWeekdays.has(date.getUTCDay())) {
      dates.push(date.toISOString().slice(0, 10));
    }
  }
  return dates;
}
