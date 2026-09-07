import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
export const mobileRoot = path.join(repositoryRoot, 'apps/mobile');

export function nativeEnvironment(env = process.env, home = homedir()) {
  const sdk =
    env.ANDROID_HOME ||
    env.ANDROID_SDK_ROOT ||
    path.join(home, 'Library/Android/sdk');
  return {
    ...env,
    ANDROID_HOME: sdk,
    ANDROID_SDK_ROOT: sdk,
    BUNDLE_GEMFILE: path.join(repositoryRoot, 'Gemfile'),
    BUNDLE_PATH: path.join(repositoryRoot, 'vendor/bundle'),
    BUNDLE_APP_CONFIG: path.join(repositoryRoot, '.bundle'),
  };
}

export function inspectHost({
  run,
  exists,
  platform,
  env,
  nodeVersion,
  nodePin,
  pnpmPin,
}) {
  const result = (ok, detail) => ({ ok, detail });
  const pnpm = run('pnpm', ['--version']);
  const javascript = [
    result(nodeVersion === nodePin, `Node ${nodeVersion}; required ${nodePin}`),
    result(pnpm === pnpmPin, `pnpm ${pnpm || 'missing'}; required ${pnpmPin}`),
    result(
      exists('apps/mobile/node_modules/expo/package.json'),
      'Local dependencies: run mise exec -- pnpm install --frozen-lockfile if missing',
    ),
  ];
  const java = run('java', ['-version']);
  const android = [
    result(/version "17\./.test(java), 'JDK 17: select the mise runtime'),
    result(
      exists(path.join(env.ANDROID_HOME, 'platform-tools/adb')),
      'Android platform-tools / adb',
    ),
    result(
      exists(path.join(env.ANDROID_HOME, 'platforms/android-36/android.jar')),
      'Android SDK platform 36',
    ),
    result(
      exists(path.join(env.ANDROID_HOME, 'build-tools/36.0.0')),
      'Android build-tools 36.0.0',
    ),
  ];
  const xcode = platform === 'darwin' ? run('xcodebuild', ['-version']) : '';
  const version = /Xcode (\d+)\.(\d+)/.exec(xcode);
  const ios = [
    result(platform === 'darwin', 'iOS requires macOS'),
    result(
      Boolean(
        version &&
        (Number(version[1]) > 26 ||
          (Number(version[1]) === 26 && Number(version[2]) >= 4)),
      ),
      'Xcode 26.4 or newer, selected with xcode-select',
    ),
    result(
      platform === 'darwin' &&
        run('bundle', ['exec', 'pod', '--version']) === '1.16.2',
      'CocoaPods 1.16.2: install the repository Gemfile bundle',
    ),
  ];
  return { javascript, android, ios };
}

export function doctor(scope = 'all') {
  if (!['all', 'javascript', 'android', 'ios'].includes(scope))
    throw new Error(`Unknown doctor scope: ${scope}`);
  const run = (command, args) => {
    const r = spawnSync(command, args, {
      encoding: 'utf8',
      timeout: 30000,
      env: nativeEnvironment(),
    });
    return r.status === 0 ? (r.stdout || r.stderr).trim() : '';
  };
  const manifest = JSON.parse(
    readFileSync(path.join(repositoryRoot, 'package.json'), 'utf8'),
  );
  const nodePin = /node = "([^"]+)"/.exec(
    readFileSync(path.join(repositoryRoot, 'mise.toml'), 'utf8'),
  )[1];
  const groups = inspectHost({
    run,
    exists: (file) => existsSync(path.resolve(repositoryRoot, file)),
    platform: process.platform,
    env: nativeEnvironment(),
    nodeVersion: process.versions.node,
    nodePin,
    pnpmPin: manifest.packageManager.split('@')[1],
  });
  for (const [name, checks] of Object.entries(groups)) {
    console.log(
      `${name} basic prerequisites: ${checks.every((c) => c.ok) ? 'READY' : 'NOT READY'}`,
    );
    for (const c of checks)
      console.log(`  ${c.ok ? 'OK' : 'MISSING/MISMATCH'} ${c.detail}`);
  }
  console.log(
    'Basic checks do not verify Xcode Platform Support, device availability, compilation, or launch. Confirm iOS Platform Support in Xcode > Settings > Components. See build.md.',
  );
  const required =
    scope === 'all'
      ? Object.values(groups).flat()
      : [
          ...groups.javascript,
          ...(scope === 'javascript' ? [] : groups[scope]),
        ];
  return required.every((c) => c.ok);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exitCode = doctor(process.argv[2]) ? 0 : 1;
}
