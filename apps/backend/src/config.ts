export const developmentUrl =
  'postgres://mireqo:mireqo_local@127.0.0.1:54329/mireqo_dev';
export const testUrl =
  'postgres://mireqo_test:mireqo_test_local@127.0.0.1:54330/mireqo_test';
export function databaseUrl(value = developmentUrl): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('DATABASE_URL must be a PostgreSQL URL');
  }
  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !url.hostname ||
    !url.pathname.slice(1)
  )
    throw new Error('DATABASE_URL must identify a PostgreSQL database');
  return value;
}
export function positiveInteger(
  value: string | undefined,
  fallback: number,
  max: number,
): number {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > max)
    throw new Error('Invalid numeric configuration');
  return Number(value);
}
export function config(env = process.env) {
  const fixture = env.WORKER_FIXTURE ?? 'off';
  if (!['off', 'success', 'fail'].includes(fixture))
    throw new Error('WORKER_FIXTURE must be off, success, or fail');
  return {
    databaseUrl: databaseUrl(env.DATABASE_URL),
    port: positiveInteger(env.PORT, 3000, 65535),
    host: env.HOST || '127.0.0.1',
    interval: positiveInteger(env.WORKER_INTERVAL_MS, 60000, 86400000),
    fixture,
  };
}
export function requireTestTarget(value: string): string {
  const target = new URL(databaseUrl(value));
  if (
    !['127.0.0.1', 'localhost'].includes(target.hostname) ||
    target.port !== '54330' ||
    target.pathname !== '/mireqo_test' ||
    target.username !== 'mireqo_test' ||
    target.search ||
    target.hash
  )
    throw new Error('Refusing non-allowlisted test database target');
  return value;
}
export function isDemoTarget(
  value: string,
  environment = process.env.NODE_ENV,
): boolean {
  const target = new URL(databaseUrl(value));
  return (
    environment !== 'production' &&
    ['localhost', '127.0.0.1'].includes(target.hostname) &&
    !target.search &&
    !target.hash &&
    ((target.port === '54329' &&
      target.pathname === '/mireqo_dev' &&
      target.username === 'mireqo') ||
      (target.port === '54330' &&
        target.pathname === '/mireqo_test' &&
        target.username === 'mireqo_test'))
  );
}
