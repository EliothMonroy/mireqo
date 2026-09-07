import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { sql } from 'kysely';
import { connect, ready } from '../src/db/database.ts';
import { migrate, seed } from '../src/db/migrations.ts';
import { requireTestTarget, testUrl, developmentUrl } from '../src/config.ts';
import { fixtureJob, runJob } from '../src/worker/jobs.ts';
import { createApp } from '../src/app.ts';
test('real PostGIS, migrations, isolation, imports and process-loss recovery', async () => {
  const url = requireTestTarget(process.env.TEST_DATABASE_URL ?? testUrl);
  const db = connect(url);
  const dev = connect(developmentUrl);
  try {
    const before =
      await sql`select * from fixture_state order by source`.execute(dev);
    await sql`drop schema public cascade`.execute(db);
    await sql`create schema public`.execute(db);
    await assert.rejects(() => ready(db));
    await migrate(db, '001_import_runs');
    const sentinel = await db
      .insertInto('import_runs')
      .values({
        source: 'sentinel',
        status: 'succeeded',
        finished_at: new Date(),
        error_code: null,
      })
      .returning('id')
      .executeTakeFirstOrThrow();
    await migrate(db);
    await migrate(db);
    await ready(db);
    assert.ok(
      await db
        .selectFrom('import_runs')
        .selectAll()
        .where('id', '=', sentinel.id)
        .executeTakeFirst(),
    );
    await seed(db);
    await seed(db);
    assert.equal(
      (await db.selectFrom('fixture_state').selectAll().execute()).length,
      1,
    );
    const spatial = await sql<{
      distance: number;
      near: boolean;
    }>`select ST_Distance(ST_Point(0,0)::geography,ST_Point(0,1)::geography) as distance, ST_DWithin(ST_Point(0,0)::geography,ST_Point(0,1)::geography,1000) as near`.execute(
      db,
    );
    assert.ok(
      spatial.rows[0]!.distance > 110000 && spatial.rows[0]!.distance < 112000,
    );
    assert.equal(spatial.rows[0]!.near, false);
    assert.equal(await runJob(db, fixtureJob()), 'succeeded');
    const attempts = await db
      .selectFrom('import_runs')
      .selectAll()
      .where('source', '=', 'fixture:worker')
      .orderBy('id')
      .execute();
    assert.deepEqual(
      attempts.map((run) => [run.status, run.error_code]),
      [['succeeded', null]],
    );
    assert.ok(attempts[0]!.started_at instanceof Date);
    assert.ok(attempts[0]!.finished_at instanceof Date);
    assert.equal(await runJob(db, fixtureJob()), 'succeeded');
    assert.equal(await runJob(db, fixtureJob(true)), 'failed');
    assert.equal(
      (
        await db
          .selectFrom('fixture_state')
          .select('executions')
          .where('source', '=', 'fixture:worker')
          .executeTakeFirstOrThrow()
      ).executions,
      2,
    );
    assert.equal(await runJob(db, fixtureJob()), 'succeeded');
    const outcomes = await db
      .selectFrom('import_runs')
      .selectAll()
      .where('source', '=', 'fixture:worker')
      .orderBy('id')
      .execute();
    assert.deepEqual(
      outcomes.map((run) => [run.status, run.error_code]),
      [
        ['succeeded', null],
        ['succeeded', null],
        ['failed', 'JOB_FAILED'],
        ['succeeded', null],
      ],
    );
    assert.equal(new Set(outcomes.map((run) => run.id)).size, 4);
    assert.ok(outcomes.every((run) => run.finished_at instanceof Date));
    const child = spawn(process.execPath, ['test/lock-child.ts'], {
      env: { ...process.env, TEST_DATABASE_URL: url },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error('Lock child timeout')),
          10000,
        );
        child.stdout.once('data', (data) => {
          clearTimeout(timer);
          assert.match(String(data), /LOCKED/);
          resolve();
        });
        child.once('error', reject);
      });
      assert.equal(
        await runJob(db, fixtureJob(false, 'fixture:crash')),
        'skipped',
      );
      assert.equal(
        await runJob(db, fixtureJob(false, 'fixture:independent')),
        'succeeded',
      );
    } finally {
      child.kill('SIGKILL');
      await once(child, 'exit');
    }
    let recovery = 'skipped';
    for (let attempt = 0; attempt < 30 && recovery === 'skipped'; attempt++) {
      recovery = await runJob(db, fixtureJob(false, 'fixture:crash'));
      if (recovery === 'skipped')
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.equal(recovery, 'succeeded');
    const recovered = await db
      .selectFrom('import_runs')
      .select('status')
      .where('source', '=', 'fixture:crash')
      .orderBy('id')
      .execute();
    assert.deepEqual(
      recovered.map((r) => r.status),
      ['interrupted', 'succeeded'],
    );
    const app = await createApp(() => ready(db));
    assert.equal((await app.inject('/v1/ready')).statusCode, 200);
    await app.close();
    const unavailable = connect(url.replace('54330', '54331'));
    const bad = await createApp(() => ready(unavailable));
    const start = Date.now();
    assert.equal((await bad.inject('/v1/ready')).statusCode, 503);
    assert.ok(Date.now() - start < 5000);
    assert.equal((await bad.inject('/v1/health')).statusCode, 200);
    await bad.close();
    await unavailable.destroy();
    assert.deepEqual(
      (await sql`select * from fixture_state order by source`.execute(dev))
        .rows,
      before.rows,
    );
  } finally {
    await db.destroy();
    await dev.destroy();
  }
});
