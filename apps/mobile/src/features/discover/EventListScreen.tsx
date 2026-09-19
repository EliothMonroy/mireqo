import { useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DiscoveryScope } from '../../data/discovery-catalog';
import {
  useDiscoverySession,
  useIsOffline,
} from '../../data/discovery-session';
import {
  useDiscoveryList,
  useDiscoveryRefresh,
} from '../../data/discovery-results';
import { scopeDateLabel, scopeTitle } from '../../domain/discovery-filters';
import { formatReferenceDate } from '../../domain/event-format';
import { Action } from '../../ui/Action';
import { useTheme } from '../../ui/theme';
import {
  Card,
  Loading,
  EventCardPlaceholders,
  Notice,
  discoveryStyles as styles,
} from './DiscoveryParts';
export function EventListScreen({
  initialScope,
  onBack,
}: {
  initialScope: DiscoveryScope;
  onBack: () => void;
}) {
  const session = useDiscoverySession();
  const [scope, setScope] = useState(initialScope);
  const renewal = useDiscoveryRefresh(scope.areaId);
  const refreshing = renewal.refreshing;
  const refreshError = renewal.error;
  const result = useDiscoveryList(scope);
  const previousSessionToken = useRef(session.context?.context.token);
  useEffect(() => {
    const token = session.context?.context.token;
    if (
      token &&
      token !== previousSessionToken.current &&
      session.context?.area.id === initialScope.areaId
    )
      setScope((current) => ({ ...current, context: token }));
    previousSessionToken.current = token;
  }, [session.context, initialScope.areaId]);
  const theme = useTheme();
  const offline = useIsOffline();
  const first = result.data?.pages[0];
  async function refresh() {
    const next = await renewal.refresh();
    if (next)
      setScope((current) => ({ ...current, context: next.context.token }));
  }
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <FlatList
        data={result.items}
        keyExtractor={(event) => event.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <Card event={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || result.isPlaceholderData}
            onRefresh={() => {
              void refresh();
            }}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
        ListHeaderComponent={
          <View style={styles.gap}>
            <Action secondary label="Back to Discover" onPress={onBack} />
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: theme.text }]}
            >
              {scopeTitle(scope)}
            </Text>
            <Text style={[styles.copy, { color: theme.muted }]}>
              {first?.area.name ??
                session.areas.find((area) => area.id === scope.areaId)?.name ??
                'Selected area'}{' '}
              · {scopeDateLabel(scope)}
              {first
                ? ` · Browsing date ${formatReferenceDate(first.context.localDate)}`
                : ''}
            </Text>
            <Text style={[styles.copy, { color: theme.muted }]}>
              Demo events. These are not real listings.
              {first
                ? ` Sample catalog: ${formatReferenceDate(first.demo.referenceDate)}.`
                : ''}
            </Text>
            {offline && (
              <Notice message="You’re offline. Showing events loaded earlier in this session, when available." />
            )}
            {result.stale && (
              <Notice message="Updating results. Showing the previous browsing snapshot until fresh results arrive." />
            )}
            {refreshError && (
              <Notice
                message={`Showing previously loaded events. ${refreshError}`}
                label="Retry refresh"
                onPress={() => {
                  void refresh();
                }}
              />
            )}
            {result.message && !result.isFetchNextPageError && (
              <Notice
                message={`${result.items.length ? 'Showing previously loaded events. ' : ''}${result.message}`}
                label={result.restart ? 'Restart list' : 'Try again'}
                onPress={
                  result.restart
                    ? () => {
                        void refresh();
                      }
                    : () => {
                        void result.refetch();
                      }
                }
              />
            )}
          </View>
        }
        ListEmptyComponent={
          result.isPending ? (
            <EventCardPlaceholders label="Loading events" />
          ) : !result.error ? (
            <View style={styles.section}>
              <Text style={[styles.copy, { color: theme.muted }]}>
                No events match this selection. Return to Discover to choose
                another date, category or area.
              </Text>
              <Action
                secondary
                label="Choose another selection"
                onPress={onBack}
              />
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {result.isFetchingNextPage ? (
              <Loading label="Loading more events" />
            ) : result.isFetchNextPageError ? (
              <Notice
                message={result.message!}
                label={result.restart ? 'Restart list' : 'Retry loading more'}
                onPress={
                  result.restart
                    ? () => {
                        void refresh();
                      }
                    : () => {
                        void result.fetchNextPage();
                      }
                }
              />
            ) : result.hasNextPage && !result.stale ? (
              <Action
                label="Load more events"
                onPress={() => {
                  if (!result.isFetching) void result.fetchNextPage();
                }}
              />
            ) : result.items.length > 0 && !result.stale ? (
              <Text style={[styles.copy, { color: theme.muted }]}>
                You’ve explored this selection.
              </Text>
            ) : null}
            {result.items.length > 0 && (
              <Action
                secondary
                label="Refresh events"
                onPress={() => {
                  void refresh();
                }}
              />
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}
