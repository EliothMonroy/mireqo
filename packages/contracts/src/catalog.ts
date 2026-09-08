import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
const object = { additionalProperties: false };
const text = Type.String({ minLength: 1 });
const date = Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' });
const instant = Type.String({
  pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,3})?Z$',
});
const timezone = Type.Literal('America/Mexico_City');
export const AreaSchema = Type.Object(
  {
    id: text,
    name: text,
    administrativeContext: text,
    kind: Type.Union([Type.Literal('municipality'), Type.Literal('city')]),
    country: Type.Literal('MX'),
    timezone,
  },
  object,
);
export const AreasResponseSchema = Type.Object(
  { items: Type.Array(AreaSchema) },
  object,
);
export const ScheduleSchema = Type.Union([
  Type.Object(
    { kind: Type.Literal('exact'), startsAt: instant, timezone },
    object,
  ),
  Type.Object({ kind: Type.Literal('date-only'), date, timezone }, object),
  Type.Object({ kind: Type.Literal('unannounced') }, object),
]);
const money = Type.Integer({ minimum: 0, maximum: 100000000 });
export const PriceSchema = Type.Union([
  Type.Object({ kind: Type.Literal('free') }, object),
  Type.Object({ kind: Type.Literal('unknown') }, object),
  Type.Object(
    {
      kind: Type.Union([Type.Literal('fixed'), Type.Literal('starting-at')]),
      amountMinor: money,
      currency: Type.Literal('MXN'),
    },
    object,
  ),
  Type.Object(
    {
      kind: Type.Literal('range'),
      minMinor: money,
      maxMinor: money,
      currency: Type.Literal('MXN'),
    },
    object,
  ),
]);
export const EventSummarySchema = Type.Object(
  {
    id: text,
    title: text,
    areaId: text,
    image: Type.Union([
      Type.Null(),
      Type.Object(
        {
          kind: Type.Literal('artwork'),
          key: Type.Union([
            Type.Literal('music'),
            Type.Literal('market'),
            Type.Literal('art'),
            Type.Literal('outdoors'),
          ]),
        },
        object,
      ),
      Type.Object(
        {
          kind: Type.Literal('remote'),
          url: Type.String({ pattern: '^https://' }),
        },
        object,
      ),
    ]),
    venue: Type.Union([text, Type.Null()]),
    neighborhood: Type.Union([text, Type.Null()]),
    category: Type.Union([text, Type.Null()]),
    schedule: ScheduleSchema,
    price: PriceSchema,
    status: Type.Union([
      Type.Literal('scheduled'),
      Type.Literal('cancelled'),
      Type.Literal('postponed'),
    ]),
    updatedAt: instant,
  },
  object,
);
export const DemoSchema = Type.Object(
  { isDemo: Type.Literal(true), referenceDate: date, datasetVersion: text },
  object,
);
export const EventsResponseSchema = Type.Object(
  {
    area: AreaSchema,
    items: Type.Array(EventSummarySchema),
    nextCursor: Type.Union([Type.String({ maxLength: 2048 }), Type.Null()]),
    demo: DemoSchema,
  },
  object,
);
export const EventsQuerySchema = Type.Object(
  {
    areaId: Type.String({ minLength: 1, maxLength: 80 }),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 30, default: 6 })),
    cursor: Type.Optional(Type.String({ minLength: 1, maxLength: 2048 })),
  },
  object,
);
export type Area = Static<typeof AreaSchema>;
export type AreasResponse = Static<typeof AreasResponseSchema>;
export type EventSummary = Static<typeof EventSummarySchema>;
export type EventsResponse = Static<typeof EventsResponseSchema>;
export type EventsQuery = Static<typeof EventsQuerySchema>;
export function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
function validInstant(value: string): boolean {
  return (
    validDate(value.slice(0, 10)) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() ===
      value.replace(
        /(?:\.(\d{1,3}))?Z$/,
        (_match, fraction: string | undefined) =>
          `.${(fraction ?? '').padEnd(3, '0')}Z`,
      )
  );
}
export function parseAreasResponse(value: unknown): AreasResponse {
  if (!Value.Check(AreasResponseSchema, value))
    throw new Error('Invalid areas response');
  return value;
}
export function parseEventsResponse(value: unknown): EventsResponse {
  if (
    !Value.Check(EventsResponseSchema, value) ||
    !validDate(value.demo.referenceDate)
  )
    throw new Error('Invalid events response');
  for (const item of value.items) {
    if (
      item.areaId !== value.area.id ||
      !validInstant(item.updatedAt) ||
      (item.schedule.kind === 'exact' &&
        !validInstant(item.schedule.startsAt)) ||
      (item.schedule.kind === 'date-only' && !validDate(item.schedule.date)) ||
      (item.price.kind === 'range' && item.price.minMinor > item.price.maxMinor)
    )
      throw new Error('Invalid event semantics');
  }
  return value;
}
