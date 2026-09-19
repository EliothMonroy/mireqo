import { useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { CatalogError } from '../../data/catalog';
import { useEventDetails, detailsError } from '../../data/event-details';
import { useSaved, useEventClock } from '../../data/saved-context';
import { useIsOffline } from '../../data/discovery-session';
import {
  locationUrl,
  openExternal,
  safeHttps,
  shareEvent,
} from '../../data/event-actions';
import {
  newestEventSnapshot,
  temporalState,
  type EventSnapshot,
} from '../../domain/saved-event';
import { formatSchedule, formatPrice } from '../../domain/event-format';
import { EventCard } from '../../ui/EventCard';
import { Action } from '../../ui/Action';
import { EventNotice, DetailPlaceholder } from '../../ui/EventStates';
import { useTheme } from '../../ui/theme';
export function EventDetailsScreen({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const theme = useTheme();
  const saved = useSaved();
  const query = useEventDetails(id);
  const client = useQueryClient();
  const offline = useIsOffline();
  const now = useEventClock();
  const [expanded, setExpanded] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const snapshot = newestEventSnapshot(
    id,
    query.data,
    saved.entries[id],
    client.getQueryData<EventSnapshot>(['event-preview', id]),
  );
  const perform = (action: () => Promise<unknown>) => {
    setActionError(null);
    void action().catch(() =>
      setActionError('This action could not be opened. Please try again.'),
    );
  };
  const canExpandDescription =
    (snapshot?.details?.description?.length ?? 0) > 200;
  const phase = snapshot ? temporalState(snapshot, now) : null;
  const external = safeHttps(snapshot?.details?.externalUrl);
  const location = snapshot ? locationUrl(snapshot) : null;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          gap: 18,
          maxWidth: 680,
          width: '100%',
          alignSelf: 'center',
        }}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !query.isPending}
            onRefresh={() => void query.refetch()}
            tintColor={theme.accent}
          />
        }
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ flex: 1, minWidth: 100 }}>
            <Action secondary label="Back" onPress={onBack} />
          </View>
          {snapshot && (
            <View style={{ flex: 1, minWidth: 100 }}>
              <Action
                secondary
                label="Share event"
                onPress={() => perform(() => shareEvent(snapshot))}
              />
            </View>
          )}
        </View>
        {actionError && <EventNotice message={actionError} />}
        {query.isPending && !snapshot && <DetailPlaceholder />}
        {query.error && (
          <EventNotice
            message={
              snapshot
                ? detailsError(query.error)
                : query.error instanceof CatalogError &&
                    query.error.code === 'NOT_FOUND'
                  ? 'This event is no longer available in the catalog. Return to Discover to choose another event.'
                  : 'This event could not be loaded. The catalog may be offline. Try again.'
            }
            onRetry={() => void query.refetch()}
          />
        )}
        {saved.error && (
          <EventNotice
            message={saved.error}
            onRetry={() => saved.store.retry()}
            label={saved.ready ? 'Retry saving' : 'Retry loading'}
          />
        )}
        {snapshot && (
          <>
            <EventCard
              event={snapshot.event}
              schedule={formatSchedule(snapshot.event.schedule)}
              price={
                formatPrice(snapshot.event.price) ?? 'Price to be announced'
              }
              saved={!!saved.entries[id]}
              saveReady={saved.ready}
              onSave={() => saved.store.toggle(snapshot)}
            />
            <Text style={{ color: theme.muted, fontSize: 14, lineHeight: 21 }}>
              Demo event · {snapshot.area.name}. Imagined, not a real listing.
            </Text>
            {(offline || !query.data || query.error) && (
              <EventNotice
                message={`${offline ? 'You’re offline. ' : ''}Last-known ${snapshot.details ? 'details' : 'summary only'}. ${snapshot.refreshedAt ? `Details last refreshed ${new Date(snapshot.refreshedAt).toLocaleString()}.` : `Summary saved or viewed ${new Date(snapshot.capturedAt).toLocaleString()}; full details have not been loaded.`}`}
              />
            )}
            {snapshot.details && query.data && !query.error && !offline && (
              <Text style={{ color: theme.muted }}>
                Details refreshed{' '}
                {new Date(snapshot.refreshedAt!).toLocaleString()}
              </Text>
            )}
            {snapshot.event.status === 'cancelled' && (
              <EventNotice message="Cancelled · This event has been cancelled." />
            )}
            {snapshot.event.status === 'postponed' && (
              <EventNotice message="Postponed · Check the latest event information before making plans." />
            )}
            {phase === 'ended' || phase === 'date-passed' ? (
              <EventNotice
                message={
                  phase === 'ended'
                    ? 'Ended · This event’s known end time has passed.'
                    : 'Date passed · The event’s local calendar day has passed; its end time is unknown.'
                }
              />
            ) : null}
            {snapshot.details?.endsAt && (
              <Text style={{ color: theme.text, fontSize: 16 }}>
                Ends{' '}
                {new Intl.DateTimeFormat('en-US', {
                  timeZone: snapshot.area.timezone,
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(snapshot.details.endsAt))}
              </Text>
            )}
            {snapshot.event.schedule.kind === 'exact' &&
              !snapshot.details?.endsAt && (
                <Text style={{ color: theme.muted }}>
                  End time not provided
                </Text>
              )}
            {snapshot.details?.address && (
              <View style={{ gap: 8 }}>
                <Text
                  accessibilityRole="header"
                  style={{ color: theme.text, fontSize: 22, fontWeight: '600' }}
                >
                  Location
                </Text>
                <Text
                  style={{ color: theme.text, fontSize: 16, lineHeight: 24 }}
                >
                  {snapshot.event.venue}
                  {'\n'}
                  {snapshot.details.address}
                  {'\n'}
                  {snapshot.area.name}
                </Text>
              </View>
            )}
            {location && (
              <Action
                secondary
                label="View location · opens maps"
                onPress={() => perform(() => openExternal(location))}
              />
            )}
            {snapshot.details?.description && (
              <View style={{ gap: 12 }}>
                <Text
                  accessibilityRole="header"
                  style={{ color: theme.text, fontSize: 22, fontWeight: '600' }}
                >
                  About this event
                </Text>
                <Text
                  numberOfLines={
                    canExpandDescription && !expanded ? 5 : undefined
                  }
                  style={{ color: theme.text, fontSize: 16, lineHeight: 25 }}
                >
                  {snapshot.details.description}
                </Text>
                {canExpandDescription && (
                  <Action
                    secondary
                    label={expanded ? 'Show less' : 'Show more'}
                    onPress={() => setExpanded((v) => !v)}
                  />
                )}
              </View>
            )}
            {!snapshot.details && (
              <EventNotice
                message="Full description, end time and address have not been downloaded. Refresh when connected."
                onRetry={() => void query.refetch()}
                label="Refresh details"
              />
            )}

            {external &&
              snapshot.event.status !== 'cancelled' &&
              phase !== 'ended' &&
              phase !== 'date-passed' && (
                <>
                  <Text style={{ color: theme.muted }}>
                    Example destination only. Opens outside Mireqo; no tickets
                    are sold.
                  </Text>
                  <Action
                    label="Open demo page"
                    onPress={() => perform(() => openExternal(external))}
                  />
                </>
              )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
