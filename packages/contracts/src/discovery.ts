import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import {
  AreaSchema,
  DemoSchema,
  EventsResponseSchema,
  parseEventsResponse,
  validDate,
} from './catalog.ts';
const object = { additionalProperties: false };
export const DiscoveryDateSchema = Type.Union([
  Type.Literal('default'),
  Type.Literal('today'),
  Type.Literal('tomorrow'),
  Type.Literal('weekend'),
  Type.Literal('week'),
]);
// Explicit literal unions keep the inferred contract narrow for consumers.
export type DiscoveryDate =
  'default' | 'today' | 'tomorrow' | 'weekend' | 'week';
export const DiscoveryCategorySchema = Type.Union([
  Type.Literal('music'),
  Type.Literal('market'),
  Type.Literal('art'),
  Type.Literal('outdoors'),
]);
export const DiscoveryCollectionSchema = Type.Union([
  Type.Literal('today'),
  Type.Literal('weekend'),
  Type.Literal('free'),
  Type.Literal('music'),
]);
export type DiscoveryCategory = Static<typeof DiscoveryCategorySchema>;
export type DiscoveryCollection = Static<typeof DiscoveryCollectionSchema>;
const instant = Type.String({
  pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$',
});
export const DiscoveryContextSchema = Type.Object(
  {
    token: Type.String({ minLength: 1, maxLength: 2048 }),
    asOf: instant,
    localDate: Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
    expiresAt: instant,
  },
  object,
);
export type DiscoveryContext = Static<typeof DiscoveryContextSchema>;
export const DiscoveryContextQuerySchema = Type.Object(
  { areaId: Type.String({ minLength: 1, maxLength: 80 }) },
  object,
);
export const DiscoveryContextResponseSchema = Type.Object(
  { area: AreaSchema, context: DiscoveryContextSchema, demo: DemoSchema },
  object,
);
export type DiscoveryContextResponse = Static<
  typeof DiscoveryContextResponseSchema
>;
export const DiscoveryFiltersSchema = Type.Object(
  {
    date: DiscoveryDateSchema,
    category: Type.Union([DiscoveryCategorySchema, Type.Null()]),
    collection: Type.Union([DiscoveryCollectionSchema, Type.Null()]),
  },
  object,
);
export type DiscoveryFilters = Omit<
  Static<typeof DiscoveryFiltersSchema>,
  'date'
> & { date: DiscoveryDate };
export const DiscoveryEventsQuerySchema = Type.Object(
  {
    areaId: Type.String({ minLength: 1, maxLength: 80 }),
    context: Type.String({ minLength: 1, maxLength: 2048 }),
    date: DiscoveryDateSchema,
    category: Type.Optional(DiscoveryCategorySchema),
    collection: Type.Optional(DiscoveryCollectionSchema),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 30, default: 6 })),
    cursor: Type.Optional(Type.String({ minLength: 1, maxLength: 4096 })),
  },
  object,
);
export type DiscoveryEventsQuery = Omit<
  Static<typeof DiscoveryEventsQuerySchema>,
  'date'
> & { date: DiscoveryDate };
export const DiscoveryEventsResponseSchema = Type.Object(
  {
    ...EventsResponseSchema.properties,
    nextCursor: Type.Union([Type.String({ maxLength: 4096 }), Type.Null()]),
    context: DiscoveryContextSchema,
    filters: DiscoveryFiltersSchema,
  },
  object,
);
export type DiscoveryEventsResponse = Omit<
  Static<typeof DiscoveryEventsResponseSchema>,
  'filters'
> & { filters: DiscoveryFilters };
export function isValidDiscoveryFilters(filters: {
  date: string;
  category?: string | null;
  collection?: string | null;
}): boolean {
  return (
    ['default', 'today', 'tomorrow', 'weekend', 'week'].includes(
      filters.date,
    ) &&
    (!filters.category ||
      ['music', 'market', 'art', 'outdoors'].includes(filters.category)) &&
    (!filters.collection ||
      ['today', 'weekend', 'free', 'music'].includes(filters.collection)) &&
    !(filters.category && filters.collection) &&
    !(
      filters.date !== 'default' &&
      (filters.collection === 'today' || filters.collection === 'weekend')
    )
  );
}
function checkContext(value: DiscoveryContext, timezone: string) {
  if (
    !validDate(value.localDate) ||
    !Number.isFinite(Date.parse(value.asOf)) ||
    !Number.isFinite(Date.parse(value.expiresAt)) ||
    new Date(value.asOf).toISOString() !== value.asOf ||
    new Date(value.expiresAt).toISOString() !== value.expiresAt ||
    value.expiresAt <= value.asOf ||
    new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(value.asOf)) !== value.localDate
  )
    throw new Error('Invalid discovery context');
}
export function parseDiscoveryContextResponse(
  value: unknown,
): DiscoveryContextResponse {
  if (
    !Value.Check(DiscoveryContextResponseSchema, value) ||
    !validDate(value.demo.referenceDate)
  )
    throw new Error('Invalid discovery context response');
  checkContext(value.context, value.area.timezone);
  return value;
}
export function parseDiscoveryEventsResponse(
  value: unknown,
): DiscoveryEventsResponse {
  if (
    !Value.Check(DiscoveryEventsResponseSchema, value) ||
    !isValidDiscoveryFilters(value.filters)
  )
    throw new Error('Invalid discovery events response');
  checkContext(value.context, value.area.timezone);
  // Reuse legacy semantic checks without passing additive fields to its strict parser.
  parseEventsResponse({
    area: value.area,
    items: value.items,
    nextCursor: null,
    demo: value.demo,
  });
  return value as DiscoveryEventsResponse;
}
