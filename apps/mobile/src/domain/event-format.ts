import type { EventSummary } from '@mireqo/contracts';
export function formatSchedule(schedule: EventSummary['schedule']): string {
  if (schedule.kind === 'unannounced') return 'Date to be announced';
  if (schedule.kind === 'date-only') {
    // UTC is only a formatting carrier for a calendar date; no event time is inferred.
    const date = new Date(`${schedule.date}T12:00:00Z`);
    return `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date)} · Time to be announced`;
  }
  const date = new Date(schedule.startsAt);
  const day = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: schedule.timezone,
  }).format(date);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: schedule.timezone,
  }).format(date);
  return `${day} · ${time} (Mexico City time)`;
}
export function formatPrice(price: EventSummary['price']): string | null {
  if (price.kind === 'unknown') return null;
  if (price.kind === 'free') return 'Free';
  const money = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      currencyDisplay: 'code',
      maximumFractionDigits: amount % 100 ? 2 : 0,
    }).format(amount / 100);
  if (price.kind === 'range')
    return `${money(price.minMinor)}–${money(price.maxMinor)}`;
  return `${price.kind === 'starting-at' ? 'From ' : ''}${money(price.amountMinor)}`;
}
export function formatReferenceDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}
