import { Linking, Share } from 'react-native';
import type { EventSnapshot } from '../domain/saved-event';
import { formatSchedule } from '../domain/event-format';
export function safeHttps(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      !!url.hostname &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function locationUrl(snapshot: EventSnapshot): string | null {
  if (!snapshot.event.venue || !snapshot.details?.address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([snapshot.event.venue, snapshot.details.address, snapshot.area.name, 'Mexico'].join(', '))}`;
}
export function shareText(snapshot: EventSnapshot) {
  return [
    snapshot.event.title,
    formatSchedule(snapshot.event.schedule),
    [snapshot.event.venue, snapshot.area.name].filter(Boolean).join(' · '),
    'Mireqo demo event — imagined, not a real listing.',
    safeHttps(snapshot.details?.externalUrl),
  ]
    .filter(Boolean)
    .join('\n');
}
export async function shareEvent(snapshot: EventSnapshot) {
  await Share.share({ message: shareText(snapshot) });
}
export async function openExternal(value: string) {
  const url = safeHttps(value);
  if (!url) throw new Error('Unsafe external URL');
  await Linking.openURL(url);
}
