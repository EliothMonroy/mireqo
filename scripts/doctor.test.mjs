import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectHost, nativeEnvironment } from './doctor.mjs';

const host = {
  run: (cmd) =>
    ({
      pnpm: '12.3.4',
      java: 'openjdk version "17.0.18"',
      xcodebuild: 'Xcode 26.6',
      bundle: '1.16.2',
    })[cmd] || '',
  exists: () => true,
  platform: 'darwin',
  env: { ANDROID_HOME: '/sdk' },
  nodeVersion: '24.20.0',
  nodePin: '24.20.0',
  pnpmPin: '12.3.4',
};

test('reports ready groups independently with compatible prerequisites', () => {
  const groups = inspectHost(host);
  assert.ok(
    Object.values(groups)
      .flat()
      .every((c) => c.ok),
  );
});
test('missing native tools do not make JavaScript readiness fail', () => {
  const groups = inspectHost({
    ...host,
    run: (cmd) => (cmd === 'pnpm' ? '12.3.4' : ''),
    platform: 'linux',
    exists: (p) => p.startsWith('node_modules'),
  });
  assert.ok(groups.javascript.every((c) => c.ok));
  assert.ok(groups.android.some((c) => !c.ok));
  assert.ok(groups.ios.every((c) => !c.ok));
});
test('detects mismatched Node, pnpm and Xcode versions', () => {
  const groups = inspectHost({
    ...host,
    nodeVersion: '22.0.0',
    run: (cmd, args) =>
      cmd === 'pnpm'
        ? '10.0.0'
        : cmd === 'xcodebuild'
          ? 'Xcode 26.2'
          : host.run(cmd, args),
  });
  assert.equal(groups.javascript[0].ok, false);
  assert.equal(groups.javascript[1].ok, false);
  assert.equal(groups.ios[1].ok, false);
});
test('honors configured Android SDK without overwriting unrelated environment', () => {
  assert.deepEqual(
    nativeEnvironment({ ANDROID_SDK_ROOT: '/custom', OTHER: 'keep' }, '/home'),
    { ANDROID_HOME: '/custom', ANDROID_SDK_ROOT: '/custom', OTHER: 'keep' },
  );
});
