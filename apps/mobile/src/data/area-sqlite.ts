import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import type { AreaPreferenceStorage } from './area-preference';

/** A namespaced migration table avoids touching unrelated local preferences. */
export function sqliteAreaStorage(): AreaPreferenceStorage {
  let database: SQLiteDatabase | undefined;
  function db() {
    if (!database) throw new Error('Preferences are not initialized');
    return database;
  }
  return {
    async initialize() {
      database ??= await openDatabaseAsync('mireqo.db');
      await database.withExclusiveTransactionAsync(async (transaction) => {
        await transaction.execAsync(
          'CREATE TABLE IF NOT EXISTS mireqo_preference_migrations (version INTEGER PRIMARY KEY NOT NULL)',
        );
        const version = await transaction.getFirstAsync<{ version: number }>(
          'SELECT MAX(version) AS version FROM mireqo_preference_migrations',
        );
        if ((version?.version ?? 0) < 1) {
          await transaction.execAsync(
            'CREATE TABLE IF NOT EXISTS mireqo_preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)',
          );
          await transaction.runAsync(
            'INSERT INTO mireqo_preference_migrations (version) VALUES (?)',
            1,
          );
        }
      });
    },
    async read() {
      const result = await db().getFirstAsync<{ value: string }>(
        'SELECT value FROM mireqo_preferences WHERE key = ?',
        'selected-area',
      );
      return result?.value ?? null;
    },
    async write(areaId) {
      await db().runAsync(
        'INSERT INTO mireqo_preferences (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        'selected-area',
        areaId,
      );
    },
  };
}
