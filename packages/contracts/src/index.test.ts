import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHealth } from './index.ts';
test('health contract validates external data', () => {
  assert.deepEqual(parseHealth({ status: 'ok' }), { status: 'ok' });
  for (const value of [
    null,
    {},
    { status: 'bad' },
    { status: 'ok', secret: 1 },
  ])
    assert.throws(() => parseHealth(value));
});
