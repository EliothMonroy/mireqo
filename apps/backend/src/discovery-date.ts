import type { DiscoveryDate } from '@mireqo/contracts';
export function localDate(instant: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}
export function addDays(date: string, days: number): string {
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
export function dateRange(
  date: string,
  mode: DiscoveryDate,
): { start: string; end: string } | null {
  if (mode === 'default') return null;
  if (mode === 'today') return { start: date, end: date };
  if (mode === 'tomorrow') {
    const day = addDays(date, 1);
    return { start: day, end: day };
  }
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const untilSunday = (7 - weekday) % 7;
  if (mode === 'week') return { start: date, end: addDays(date, untilSunday) };
  return {
    start: addDays(date, weekday === 0 ? 0 : 6 - weekday),
    end: addDays(date, untilSunday),
  };
}
