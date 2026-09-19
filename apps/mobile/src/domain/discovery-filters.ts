import type {
  DiscoveryDate,
  DiscoveryCategory,
  DiscoveryCollection,
} from '@mireqo/contracts';
export interface DiscoveryScope {
  areaId: string;
  context: string;
  date: DiscoveryDate;
  category?: DiscoveryCategory;
  collection?: DiscoveryCollection;
}
export const dates: { id: DiscoveryDate; label: string }[] = [
  { id: 'default', label: 'Upcoming' },
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'weekend', label: 'This Weekend' },
  { id: 'week', label: 'This Week' },
];
export const categories: { id: DiscoveryCategory; label: string }[] = [
  { id: 'music', label: 'Music' },
  { id: 'market', label: 'Market' },
  { id: 'art', label: 'Art' },
  { id: 'outdoors', label: 'Outdoors' },
];
export const collections: { id: DiscoveryCollection; label: string }[] = [
  { id: 'today', label: 'Happening Today' },
  { id: 'weekend', label: 'This Weekend' },
  { id: 'free', label: 'Free Events' },
  { id: 'music', label: 'Music' },
];
export function scopeTitle(
  scope: Pick<DiscoveryScope, 'category' | 'collection' | 'date'>,
): string {
  return (
    (scope.collection &&
      collections.find((item) => item.id === scope.collection)?.label) ||
    (scope.category &&
      categories.find((item) => item.id === scope.category)?.label) ||
    (scope.date === 'default' ? 'All upcoming events' : 'All events')
  );
}
export function dateLabel(date: DiscoveryDate): string {
  return dates.find((item) => item.id === date)!.label;
}
// Route values are external input, including deep links. Never coerce arrays or unknown filters.
export function parseDiscoveryRoute(
  params: Record<string, string | string[] | undefined>,
): DiscoveryScope | null {
  const { areaId, context, date, category, collection } = params;
  if (
    typeof areaId !== 'string' ||
    !areaId ||
    areaId.length > 80 ||
    typeof context !== 'string' ||
    !context ||
    context.length > 2048 ||
    typeof date !== 'string' ||
    !dates.some((item) => item.id === date)
  )
    return null;
  if (
    category !== undefined &&
    (typeof category !== 'string' ||
      !categories.some((item) => item.id === category))
  )
    return null;
  if (
    collection !== undefined &&
    (typeof collection !== 'string' ||
      !collections.some((item) => item.id === collection))
  )
    return null;
  if (category && collection) return null;
  if (
    (collection === 'today' || collection === 'weekend') &&
    date !== 'default'
  )
    return null;
  return {
    areaId,
    context,
    date: date as DiscoveryDate,
    ...(category ? { category: category as DiscoveryCategory } : {}),
    ...(collection ? { collection: collection as DiscoveryCollection } : {}),
  };
}

export function scopeDateLabel(
  scope: Pick<DiscoveryScope, 'date' | 'collection'>,
): string {
  return dateLabel(
    scope.collection === 'today' || scope.collection === 'weekend'
      ? scope.collection
      : scope.date,
  );
}
