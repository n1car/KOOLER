const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const WEEKDAYS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatDate(value: string): string {
  if (!value) return "";
  const date = parseDateOnly(value);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatWeekday(value: string): string {
  if (!value) return "";
  const date = parseDateOnly(value);
  const word = WEEKDAYS[date.getDay()];
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function formatDateLong(value: string): string {
  if (!value) return "";
  return `${formatWeekday(value)}, ${formatDate(value)}`;
}

export function formatTimeRange(start?: string | null, end?: string | null): string {
  if (!start && !end) return "";
  if (start && end) return `${start} - ${end}`;
  return start ?? end ?? "";
}

export function formatDateTime(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
