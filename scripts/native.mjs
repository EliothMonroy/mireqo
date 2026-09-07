import { spawnSync } from 'node:child_process';
import { doctor, nativeEnvironment, mobileRoot } from './doctor.mjs';

const platform = process.argv[2];
if (!['android', 'ios'].includes(platform))
  throw new Error('Expected android or ios');
if (!doctor(platform)) process.exit(1);
// Bundler keeps CocoaPods local. No automatic global gem installation fallback.
const command = platform === 'ios' ? 'bundle' : 'pnpm';
const args =
  platform === 'ios'
    ? ['exec', 'pnpm', 'exec', 'expo', 'run:ios']
    : ['exec', 'expo', 'run:android'];
const result = spawnSync(command, [...args, ...process.argv.slice(3)], {
  stdio: 'inherit',
  cwd: mobileRoot,
  env: nativeEnvironment(),
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
