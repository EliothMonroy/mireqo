import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
export const HealthSchema = Type.Object(
  { status: Type.Literal('ok') },
  { additionalProperties: false },
);
export const ErrorSchema = Type.Object(
  {
    error: Type.Object(
      { code: Type.String(), message: Type.String() },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export type Health = Static<typeof HealthSchema>;
export type ApiError = Static<typeof ErrorSchema>;
export function parseHealth(value: unknown): Health {
  if (!Value.Check(HealthSchema, value))
    throw new Error('Invalid health response');
  return value;
}
