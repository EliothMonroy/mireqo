import {
  parseEventDetailsResponse,
  type EventDetailsResponse,
  type EventSummary,
  type Area,
  type EventsResponse,
  parseEventsResponse,
} from '@mireqo/contracts';
export type EventSnapshot = {
  event: EventSummary;
  area: Area;
  demo: EventsResponse['demo'];
  details: EventDetailsResponse['details'] | null;
  capturedAt: string;
  refreshedAt: string | null;
};
export function summarySnapshot(
  event: EventSummary,
  area: Area,
  demo: EventsResponse['demo'],
  now = new Date().toISOString(),
): EventSnapshot {
  return {
    event,
    area,
    demo,
    details: null,
    capturedAt: now,
    refreshedAt: null,
  };
}
export function detailSnapshot(
  value: EventDetailsResponse,
  now = new Date().toISOString(),
): EventSnapshot {
  return { ...value, capturedAt: now, refreshedAt: now };
}
/** Choose whole same-event snapshots without assigning freshness to missing details. */
export function newestEventSnapshot(
  id: string,
  ...candidates: (EventSnapshot | undefined)[]
): EventSnapshot | undefined {
  let selected: EventSnapshot | undefined;
  for (const candidate of candidates) {
    if (!candidate || candidate.event.id !== id) continue;
    if (!selected) {
      selected = candidate;
      continue;
    }
    const complete = candidate.details !== null;
    const selectedComplete = selected.details !== null;
    if (complete !== selectedComplete) {
      if (complete) selected = candidate;
      continue;
    }
    const candidateTime = Date.parse(
      complete ? candidate.refreshedAt! : candidate.capturedAt,
    );
    const selectedTime = Date.parse(
      selectedComplete ? selected.refreshedAt! : selected.capturedAt,
    );
    if (candidateTime > selectedTime) selected = candidate;
  }
  return selected;
}

export function parseSnapshot(raw: string): EventSnapshot {
  const value = JSON.parse(raw) as EventSnapshot;
  if (!validEventId(value?.event?.id))
    throw new Error('Invalid snapshot identity');
  parseEventsResponse({
    area: value.area,
    demo: value.demo,
    items: [value.event],
    nextCursor: null,
  });
  if (
    !Number.isFinite(Date.parse(value.capturedAt)) ||
    (value.refreshedAt !== null &&
      !Number.isFinite(Date.parse(value.refreshedAt)))
  )
    throw new Error('Invalid snapshot date');
  if (value.details !== null) {
    parseEventDetailsResponse({
      event: value.event,
      area: value.area,
      demo: value.demo,
      details: value.details,
    });
    if (!value.refreshedAt) throw new Error('Missing detail freshness');
  } else if (value.refreshedAt !== null)
    throw new Error('Invalid summary freshness');
  return value;
}
export function localDay(instant: number, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function temporalState(
  snapshot: Pick<EventSnapshot, 'event' | 'details'>,
  now: number,
): 'upcoming' | 'ended' | 'date-passed' | 'undated' {
  const schedule = snapshot.event.schedule;
  if (schedule.kind === 'unannounced') return 'undated';
  if (snapshot.details?.endsAt)
    return now >= Date.parse(snapshot.details.endsAt) ? 'ended' : 'upcoming';
  const day =
    schedule.kind === 'date-only'
      ? schedule.date
      : localDay(Date.parse(schedule.startsAt), schedule.timezone);
  return localDay(now, schedule.timezone) > day ? 'date-passed' : 'upcoming';
}
export function sortSnapshots(a: EventSnapshot, b: EventSnapshot): number {
  const key = (s: EventSnapshot) =>
    s.event.schedule.kind === 'unannounced'
      ? '9999'
      : s.event.schedule.kind === 'date-only'
        ? `${s.event.schedule.date}T00:00`
        : new Intl.DateTimeFormat('sv-SE', {
            timeZone: s.event.schedule.timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
          })
            .format(new Date(s.event.schedule.startsAt))
            .replace(' ', 'T');
  return key(a).localeCompare(key(b)) || a.event.id.localeCompare(b.event.id);
}
export function validEventId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[a-zA-Z0-9][a-zA-Z0-9_:-]{0,159}$/.test(value)
  );
}

// Unknown ends sort by their calendar day; the suffix is an ordering marker,
// never a fabricated end instant or an assertion of completion.
export function sortPastSnapshots(a: EventSnapshot, b: EventSnapshot): number {
  const key = (s: EventSnapshot) => {
    if (s.details?.endsAt)
      return new Intl.DateTimeFormat('sv-SE', {
        timeZone: s.area.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      })
        .format(new Date(s.details.endsAt))
        .replace(' ', 'T');
    const schedule = s.event.schedule;
    return schedule.kind === 'date-only'
      ? `${schedule.date}~`
      : schedule.kind === 'exact'
        ? `${localDay(Date.parse(schedule.startsAt), schedule.timezone)}~`
        : '9999';
  };
  return key(b).localeCompare(key(a)) || a.event.id.localeCompare(b.event.id);
}
