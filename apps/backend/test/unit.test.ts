import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { ErrorSchema, HealthSchema } from '@mireqo/contracts';
import { createApp } from '../src/app.ts';
import {
  config,
  requireTestTarget,
  testUrl,
  developmentUrl,
} from '../src/config.ts';
test('API schemas, errors, docs and database-independent liveness', async () => {
  const app = await createApp(async () => {
    throw new Error('password=secret SQL');
  });
  app.post(
    '/test',
    { schema: { body: Type.Object({ name: Type.String() }) } },
    async () => ({}),
  );
  app.get('/explode', async () => {
    throw new Error('secret SQL');
  });
  try {
    const health = await app.inject('/v1/health');
    assert.equal(health.statusCode, 200);
    assert.ok(Value.Check(HealthSchema, health.json()));
    const readiness = await app.inject('/v1/ready');
    assert.equal(readiness.statusCode, 503);
    assert.ok(Value.Check(ErrorSchema, readiness.json()));
    assert.doesNotMatch(readiness.body, /password|secret|SQL/);
    assert.deepEqual((await app.inject('/missing')).json(), {
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
    const invalid = await app.inject({
      method: 'POST',
      url: '/test',
      payload: {},
    });
    assert.equal(invalid.statusCode, 400);
    assert.deepEqual(invalid.json(), {
      error: { code: 'INVALID_REQUEST', message: 'Invalid request' },
    });
    assert.ok(Value.Check(ErrorSchema, invalid.json()));
    const error = await app.inject('/explode');
    assert.equal(error.statusCode, 500);
    assert.ok(Value.Check(ErrorSchema, error.json()));
    assert.doesNotMatch(error.body, /secret|SQL/);
    const spec = (await app.inject('/v1/openapi.json')).json();
    assert.deepEqual(
      spec.paths['/v1/health'].get.responses['200'].content['application/json']
        .schema.properties.status.enum,
      ['ok'],
    );
  } finally {
    await app.close();
  }
});
test('configuration and destructive test-target guard reject unsafe input', () => {
  assert.equal(requireTestTarget(testUrl), testUrl);
  for (const url of [
    developmentUrl,
    testUrl.replace('127.0.0.1', 'example.com'),
    testUrl + '?host=evil',
    testUrl.replace('/mireqo_test', '/other'),
  ])
    assert.throws(() => requireTestTarget(url));
  for (const env of [
    { PORT: '0' },
    { PORT: 'x' },
    { WORKER_FIXTURE: 'live' },
    { DATABASE_URL: 'https://x/y' },
  ])
    assert.throws(() => config(env));
});

test('relative calendar ranges use selected-area dates and calendar boundaries', async () => {
  const { dateRange, localDate } = await import('../src/discovery-date.ts');
  assert.equal(
    localDate(new Date('2026-09-19T05:59:59.999Z'), 'America/Mexico_City'),
    '2026-09-18',
  );
  assert.equal(
    localDate(new Date('2026-09-19T06:00:00.000Z'), 'America/Mexico_City'),
    '2026-09-19',
  );
  for (const [date, start, end] of [
    ['2026-09-14', '2026-09-19', '2026-09-20'],
    ['2026-09-18', '2026-09-19', '2026-09-20'],
    ['2026-09-19', '2026-09-19', '2026-09-20'],
    ['2026-09-20', '2026-09-20', '2026-09-20'],
    ['2026-12-31', '2027-01-02', '2027-01-03'],
  ] as const)
    assert.deepEqual(dateRange(date, 'weekend'), { start, end });
  assert.deepEqual(dateRange('2024-02-28', 'tomorrow'), {
    start: '2024-02-29',
    end: '2024-02-29',
  });
  assert.deepEqual(dateRange('2024-02-29', 'tomorrow'), {
    start: '2024-03-01',
    end: '2024-03-01',
  });
  assert.deepEqual(dateRange('2026-12-31', 'week'), {
    start: '2026-12-31',
    end: '2027-01-03',
  });
  assert.deepEqual(dateRange('2026-09-20', 'week'), {
    start: '2026-09-20',
    end: '2026-09-20',
  });
  assert.equal(dateRange('2026-09-18', 'default'), null);
});
