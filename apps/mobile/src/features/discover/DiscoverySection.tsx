import { Text, View } from 'react-native';
import type { DiscoveryScope } from '../../data/discovery-catalog';
import { useDiscoveryPreview } from '../../data/discovery-results';
import { Action } from '../../ui/Action';
import { useTheme } from '../../ui/theme';
import {
  Card,
  EventCardPlaceholders,
  Notice,
  discoveryStyles as styles,
} from './DiscoveryParts';
export function DiscoverySection({
  scope,
  title,
  general = false,
  onOpen,
  onRestart,
  onEmptyRecovery,
}: {
  scope: DiscoveryScope;
  title: string;
  general?: boolean;
  onOpen: (scope: DiscoveryScope) => void;
  onRestart: () => void;
  onEmptyRecovery: () => void;
}) {
  const result = useDiscoveryPreview(scope);
  const theme = useTheme();
  if (
    !general &&
    result.data?.items.length === 0 &&
    !result.error &&
    !result.isFetching
  )
    return null;
  return (
    <View style={styles.section}>
      <View style={styles.row}>
        <Text
          accessibilityRole="header"
          style={[styles.heading, { color: theme.text }]}
        >
          {title}
        </Text>
        {result.data?.nextCursor && !result.stale && (
          <Action
            secondary
            label={
              general ? 'See all events' : `See all ${title.toLowerCase()}`
            }
            onPress={() => onOpen(scope)}
          />
        )}
      </View>
      {result.isPending && (
        <EventCardPlaceholders label={`Loading ${title.toLowerCase()}`} />
      )}
      {result.stale && (
        <Notice message="Updating this section. Showing the previous browsing snapshot until fresh results arrive." />
      )}
      {result.message && (
        <Notice
          message={`${result.data?.items.length ? 'Showing previously loaded events. ' : ''}${result.message}`}
          label={
            result.restart
              ? 'Refresh discovery'
              : `Retry ${title.toLowerCase()}`
          }
          onPress={
            result.restart
              ? onRestart
              : () => {
                  void result.refetch();
                }
          }
        />
      )}
      {result.data?.items.map((event) => (
        <Card key={event.id} event={event} />
      ))}
      {general &&
        result.data?.items.length === 0 &&
        !result.error &&
        !result.isFetching && (
          <View style={styles.gap}>
            <Text style={[styles.copy, { color: theme.muted }]}>
              No events match this area and date. Try another date or area.
            </Text>
            <Action
              secondary
              label={scope.date === 'default' ? 'Change area' : 'Reset date'}
              onPress={onEmptyRecovery}
            />
          </View>
        )}
    </View>
  );
}
