import { Linking, Share } from 'react-native';
import {
  safeHttps,
  shareText,
  shareEvent,
  openExternal,
  locationUrl,
} from './event-actions';
import { summarySnapshot } from '../domain/saved-event';
import { context, page } from '../test/discovery-fixtures';
const ctx = context();
const s = summarySnapshot(
  page({ areaId: 'coacalco', context: 'x', date: 'default' }).items[0]!,
  ctx.area,
  ctx.demo,
);
test('external boundaries reject unsafe schemes and credentials', async () => {
  for (const url of [
    'javascript:alert(1)',
    'file:///tmp/x',
    'http://example.org',
    'https://user:pass@example.org',
  ])
    expect(safeHttps(url)).toBeNull();
  expect(safeHttps('https://example.org/')).toBe('https://example.org/');
  await expect(openExternal('javascript:x')).rejects.toThrow();
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  await openExternal('https://example.org/');
  expect(open).toHaveBeenCalledWith('https://example.org/');
  open.mockRestore();
});
test('native share identifies demo with schedule; venue requires complete information', async () => {
  expect(shareText(s)).toContain('imagined, not a real listing');
  expect(shareText(s)).toContain(s.event.title);
  expect(locationUrl(s)).toBeNull();
  expect(
    locationUrl({
      ...s,
      event: { ...s.event, venue: 'Place' },
      details: {
        endsAt: null,
        address: 'Street 1',
        description: null,
        externalUrl: null,
      },
    }),
  ).toContain('Place%2C%20Street%201');
  const share = jest
    .spyOn(Share, 'share')
    .mockResolvedValue({ action: Share.dismissedAction });
  await shareEvent(s);
  expect(share).toHaveBeenCalledWith({ message: shareText(s) });
  share.mockRestore();
});
