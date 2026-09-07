import { connect } from '../src/db/database.ts';
import { requireTestTarget } from '../src/config.ts';
import { runJob } from '../src/worker/jobs.ts';
const db = connect(requireTestTarget(process.env.TEST_DATABASE_URL!));
try {
  await runJob(db, {
    source: 'fixture:crash',
    async run() {
      process.stdout.write('LOCKED\n');
      await new Promise((resolve) => setTimeout(resolve, 30000));
    },
  });
} finally {
  await db.destroy();
}
