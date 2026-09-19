import {
  parseDiscoveryRoute,
  scopeTitle,
  scopeDateLabel,
} from './discovery-filters';
const valid = {
  areaId: 'coacalco',
  context: 'token',
  date: 'today',
  category: 'art',
};
test('routes carry validated identities rather than full events and reject malformed combinations', () => {
  expect(parseDiscoveryRoute(valid)).toEqual(valid);
  for (const extra of [
    { date: 'custom' },
    { category: ['art'] },
    { category: 'sports' },
    { collection: 'free' },
    { context: '' },
    { date: 'tomorrow', category: undefined, collection: 'today' },
  ])
    expect(parseDiscoveryRoute({ ...valid, ...extra })).toBeNull();
});
test('collection and category titles remain meaningful independently of date', () => {
  expect(scopeTitle({ date: 'today', category: 'art' })).toBe('Art');
  expect(scopeTitle({ date: 'default', collection: 'free' })).toBe(
    'Free Events',
  );
  expect(scopeTitle({ date: 'default' })).toBe('All upcoming events');
});

test('temporal collection labels identify their calendar range rather than default upcoming eligibility', () => {
  expect(scopeDateLabel({ date: 'default', collection: 'today' })).toBe(
    'Today',
  );
  expect(scopeDateLabel({ date: 'default', collection: 'weekend' })).toBe(
    'This Weekend',
  );
  expect(scopeDateLabel({ date: 'today', collection: 'free' })).toBe('Today');
});
