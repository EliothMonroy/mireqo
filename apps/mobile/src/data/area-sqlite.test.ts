import { openDatabaseAsync } from 'expo-sqlite';
import { sqliteAreaStorage } from './area-sqlite';
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
test('versioned preference migration preserves existing keys and uses bound writes', async () => {
  const transaction = {
    execAsync: jest.fn(async () => {}),
    getFirstAsync: jest.fn(async () => ({ version: 1 })),
    runAsync: jest.fn(async () => {}),
  };
  const db = {
    withExclusiveTransactionAsync: jest.fn(async (work) => work(transaction)),
    getFirstAsync: jest.fn(async () => ({ value: 'mexico-city' })),
    runAsync: jest.fn(async () => {}),
  };
  jest.mocked(openDatabaseAsync).mockResolvedValue(db as never);
  const storage = sqliteAreaStorage();
  await storage.initialize();
  expect(transaction.runAsync).not.toHaveBeenCalled();
  expect(transaction.execAsync).not.toHaveBeenCalledWith(
    expect.stringContaining('DROP'),
  );
  expect(await storage.read()).toBe('mexico-city');
  await storage.write('coacalco');
  expect(db.runAsync).toHaveBeenCalledWith(
    expect.stringContaining('ON CONFLICT(key)'),
    'selected-area',
    'coacalco',
  );
});
test('fresh migration creates version once in a native exclusive transaction and propagates failure', async () => {
  const transaction = {
    execAsync: jest.fn(async () => {}),
    getFirstAsync: jest.fn(async () => ({ version: null })),
    runAsync: jest.fn(async () => {}),
  };
  const db = {
    withExclusiveTransactionAsync: jest.fn(async (work) => work(transaction)),
  };
  jest.mocked(openDatabaseAsync).mockResolvedValue(db as never);
  const storage = sqliteAreaStorage();
  await storage.initialize();
  expect(transaction.runAsync).toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO mireqo_preference_migrations'),
    1,
  );
  transaction.execAsync.mockRejectedValueOnce(new Error('disk unavailable'));
  await expect(storage.initialize()).rejects.toThrow('disk unavailable');
});
