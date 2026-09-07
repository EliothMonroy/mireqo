import { config } from '../config.ts';
import { connect, ready } from '../db/database.ts';
import { fixtureJob, runJob } from './jobs.ts';
const settings = config();
const db = connect(settings.databaseUrl);
const jobs =
  settings.fixture === 'off' ? [] : [fixtureJob(settings.fixture === 'fail')];
let stopping = false;
let wake: (() => void) | undefined;
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => {
    stopping = true;
    wake?.();
  });
try {
  await ready(db);
  console.log(
    JSON.stringify({ message: 'Worker started', sources: jobs.length }),
  );
  while (!stopping) {
    for (const job of jobs) {
      if (stopping) break;
      try {
        console.log(
          JSON.stringify({ source: job.source, result: await runJob(db, job) }),
        );
      } catch {
        console.error(
          JSON.stringify({ source: job.source, error: 'IMPORT_UNAVAILABLE' }),
        );
      }
    }
    if (!stopping)
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, settings.interval);
        wake = () => {
          clearTimeout(timer);
          resolve();
        };
      });
  }
} catch {
  console.error(
    'Worker startup failed; check database configuration and migrations',
  );
  process.exitCode = 1;
} finally {
  await db.destroy();
}
