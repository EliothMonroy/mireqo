import { config } from '../config.ts';
import { connect } from './database.ts';
import { migrate, seed } from './migrations.ts';
const db = connect(config().databaseUrl);
try {
  const operation = process.argv[2];
  if (operation === 'migrate') await migrate(db);
  else if (operation === 'seed') await seed(db);
  else throw new Error('Expected migrate or seed');
  console.log('Database operation completed');
} catch {
  console.error(
    'Database operation failed; check configuration and database availability',
  );
  process.exitCode = 1;
} finally {
  await db.destroy();
}
