import type {
  Area,
  DiscoveryContextResponse,
  DiscoveryEventsResponse,
} from '@mireqo/contracts';
import type { DiscoveryScope } from '../data/discovery-catalog';
export const areas: Area[] = ['coacalco', 'tultitlan'].map((id) => ({
  id,
  name: id,
  administrativeContext: 'Estado de México',
  kind: 'municipality',
  country: 'MX',
  timezone: 'America/Mexico_City',
}));
export function context(
  areaId = 'coacalco',
  token = 'generation',
): DiscoveryContextResponse {
  return {
    area: areas.find((area) => area.id === areaId)!,
    context: {
      token,
      asOf: '2026-09-18T12:00:00.000Z',
      localDate: '2026-09-18',
      expiresAt: '2026-09-19T12:00:00.000Z',
    },
    demo: { isDemo: true, referenceDate: '2026-09-18', datasetVersion: 'v2' },
  };
}
export function page(
  scope: DiscoveryScope,
  id = 'one',
  nextCursor: string | null = null,
): DiscoveryEventsResponse {
  return {
    ...context(scope.areaId, scope.context),
    filters: {
      date: scope.date,
      category: scope.category ?? null,
      collection: scope.collection ?? null,
    },
    items: [
      {
        id,
        title: id,
        areaId: scope.areaId,
        image: null,
        venue: null,
        neighborhood: null,
        category: null,
        schedule: { kind: 'unannounced' },
        price: { kind: 'unknown' },
        status: 'scheduled',
        updatedAt: '2026-09-18T12:00:00Z',
      },
    ],
    nextCursor,
  };
}
