import { serializeLocalIO } from './local-io';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import type { SavedStorage } from './saved-store';
export function sqliteSavedStorage(): SavedStorage {
  let database: SQLiteDatabase | undefined;
  function db() {
    if (!database) throw new Error('Saved storage is not ready');
    return database;
  }
  return {
    async initialize() {
      return serializeLocalIO(async () => {
        database ??= await openDatabaseAsync('mireqo.db');
        await database.execAsync('PRAGMA busy_timeout = 5000');
        await database.withExclusiveTransactionAsync(async (tx) => {
          await tx.execAsync(
            'CREATE TABLE IF NOT EXISTS mireqo_saved_migrations (version INTEGER PRIMARY KEY NOT NULL)',
          );
          const version = await tx.getFirstAsync<{ version: number }>(
            'SELECT MAX(version) AS version FROM mireqo_saved_migrations',
          );
          if ((version?.version ?? 0) < 1) {
            await tx.execAsync(
              'CREATE TABLE IF NOT EXISTS mireqo_saved_events (id TEXT PRIMARY KEY NOT NULL, snapshot TEXT NOT NULL)',
            );
            await tx.runAsync(
              'INSERT INTO mireqo_saved_migrations (version) VALUES (?)',
              1,
            );
          }
        });
      });
    },
    async read() {
      return serializeLocalIO(async () => {
        return db().getAllAsync<{ id: string; snapshot: string }>(
          'SELECT id, snapshot FROM mireqo_saved_events',
        );
      });
    },
    async write(id, value) {
      return serializeLocalIO(async () => {
        await db().withExclusiveTransactionAsync(async (tx) => {
          if (value)
            await tx.runAsync(
              'INSERT INTO mireqo_saved_events (id,snapshot) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET snapshot=excluded.snapshot',
              id,
              JSON.stringify(value),
            );
          else
            await tx.runAsync(
              'DELETE FROM mireqo_saved_events WHERE id = ?',
              id,
            );
        });
      });
    },
  };
}
