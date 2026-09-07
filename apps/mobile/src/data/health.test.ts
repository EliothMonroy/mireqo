import { parseHealth } from './health';

test('accepts the shared foundation health response', () => {
  expect(parseHealth({ status: 'ok' })).toEqual({ status: 'ok' });
});

test.each([null, {}, { status: 'unknown' }, { status: 1 }])(
  'rejects malformed foundation responses: %p',
  (value) => {
    expect(() => parseHealth(value)).toThrow();
  },
);
