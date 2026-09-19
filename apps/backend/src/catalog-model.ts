import type { Area } from '@mireqo/contracts';
import type { Database } from './db/database.ts';
export class CatalogError extends Error {
  statusCode: number;
  code: string;
  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
export function toArea(row: Database['browse_areas']): Area {
  return {
    id: row.id,
    name: row.name,
    administrativeContext: row.administrative_context,
    kind: row.kind,
    country: row.country,
    timezone: row.timezone,
  };
}
