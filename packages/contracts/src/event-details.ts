import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import {
  AreaSchema,
  DemoSchema,
  EventSummarySchema,
  parseEventsResponse,
  validInstant,
} from './catalog.ts';

const object = { additionalProperties: false };
// Colons preserve the established demo:<area>:<index> catalog identities.
export const EventIdParamsSchema = Type.Object(
  {
    eventId: Type.String({
      minLength: 1,
      maxLength: 160,
      pattern: '^[a-zA-Z0-9][a-zA-Z0-9_:-]{0,159}$',
    }),
  },
  object,
);
export const EventDetailsSchema = Type.Object(
  {
    endsAt: Type.Union([
      Type.Null(),
      Type.String({
        pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,3})?Z$',
      }),
    ]),
    description: Type.Union([
      Type.Null(),
      Type.String({ minLength: 1, maxLength: 20000 }),
    ]),
    address: Type.Union([
      Type.Null(),
      Type.String({ minLength: 1, maxLength: 1000 }),
    ]),
    externalUrl: Type.Union([
      Type.Null(),
      Type.String({ minLength: 1, maxLength: 2048, pattern: '^https://' }),
    ]),
  },
  object,
);
export const EventDetailsResponseSchema = Type.Object(
  {
    event: EventSummarySchema,
    area: AreaSchema,
    demo: DemoSchema,
    details: EventDetailsSchema,
  },
  object,
);
export type EventDetails = Static<typeof EventDetailsSchema>;
export type EventDetailsResponse = Static<typeof EventDetailsResponseSchema>;
export function parseEventDetailsResponse(
  value: unknown,
): EventDetailsResponse {
  if (!Value.Check(EventDetailsResponseSchema, value))
    throw new Error('Invalid event details response');
  parseEventsResponse({
    area: value.area,
    items: [value.event],
    demo: value.demo,
    nextCursor: null,
  });
  if (!Value.Check(EventIdParamsSchema, { eventId: value.event.id }))
    throw new Error('Invalid event ID');
  const { endsAt, description, address, externalUrl } = value.details;
  if (
    (description !== null && !description.trim()) ||
    (address !== null && !address.trim())
  )
    throw new Error('Invalid detail text');
  if (
    endsAt !== null &&
    (!validInstant(endsAt) ||
      value.event.schedule.kind !== 'exact' ||
      Date.parse(endsAt) <= Date.parse(value.event.schedule.startsAt))
  )
    throw new Error('Invalid event end');
  if (externalUrl !== null) {
    const url = new URL(externalUrl);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      /[\\\s]/.test(externalUrl) ||
      (value.demo.isDemo && externalUrl !== 'https://example.org/')
    )
      throw new Error('Invalid external event URL');
  }
  return value;
}
