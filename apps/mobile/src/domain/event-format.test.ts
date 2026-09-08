import { formatPrice, formatSchedule } from './event-format';
test('exact dates retain Mexico City time across a UTC date boundary', () => {
  expect(
    formatSchedule({
      kind: 'exact',
      startsAt: '2026-09-08T02:30:00Z',
      timezone: 'America/Mexico_City',
    }),
  ).toBe('Sep 7, 2026 · 8:30 PM (Mexico City time)');
});
test('date only does not invent a time, unannounced is explicit', () => {
  expect(
    formatSchedule({
      kind: 'date-only',
      date: '2026-09-07',
      timezone: 'America/Mexico_City',
    }),
  ).toBe('Sep 7, 2026 · Time to be announced');
  expect(formatSchedule({ kind: 'unannounced' })).toBe('Date to be announced');
});
test('only explicit free prices show Free; all monetary states preserve amounts', () => {
  expect(formatPrice({ kind: 'unknown' })).toBeNull();
  expect(formatPrice({ kind: 'free' })).toBe('Free');
  expect(
    formatPrice({ kind: 'fixed', amountMinor: 1550, currency: 'MXN' }),
  ).toMatch(/15\.50/);
  expect(
    formatPrice({ kind: 'starting-at', amountMinor: 10000, currency: 'MXN' }),
  ).toMatch(/^From MXN\s100$/);
  expect(
    formatPrice({
      kind: 'range',
      minMinor: 5000,
      maxMinor: 10000,
      currency: 'MXN',
    }),
  ).toMatch(/50.*100/);
});
