// Expo exclusive transactions use separate connections. Serialize all local
// adapters so simultaneous migrations/writes cannot lock each other out.
let pending: Promise<unknown> = Promise.resolve();
export function serializeLocalIO<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(operation);
  pending = result.catch(() => undefined);
  return result;
}
