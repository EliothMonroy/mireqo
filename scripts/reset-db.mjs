import { spawnSync } from 'node:child_process';
if (process.argv[2] !== '--delete-local-development-data') {
  console.error('Destructive reset requires --delete-local-development-data');
  process.exit(1);
}
// The fixed Compose project and volume target only this repository's local development service.
for (const args of [
  [
    'compose',
    '-f',
    'infrastructure/compose.yaml',
    'rm',
    '--stop',
    '--force',
    'db',
  ],
  ['volume', 'rm', 'mireqo_development'],
]) {
  const result = spawnSync('docker', args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
