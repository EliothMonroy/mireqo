import { config } from './config.ts';
import { connect, ready } from './db/database.ts';
import { createApp } from './app.ts';
const settings = config();
const db = connect(settings.databaseUrl);
const app = await createApp(() => ready(db), true);
app.addHook('onClose', async () => db.destroy());
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await app.close();
}
process.once('SIGINT', () => void stop());
process.once('SIGTERM', () => void stop());
try {
  await app.listen({ host: settings.host, port: settings.port });
} catch {
  app.log.error('API startup failed');
  await stop();
  process.exitCode = 1;
}
