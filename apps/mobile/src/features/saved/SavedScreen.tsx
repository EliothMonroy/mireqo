import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSaved, useEventClock } from '../../data/saved-context';
import { getEventDetails } from '../../data/event-details';
import { useIsOffline } from '../../data/discovery-session';
import {
  detailSnapshot,
  sortSnapshots,
  sortPastSnapshots,
  temporalState,
} from '../../domain/saved-event';
import { formatSchedule, formatPrice } from '../../domain/event-format';
import { useTheme } from '../../ui/theme';
import { EventCard } from '../../ui/EventCard';
import { Action } from '../../ui/Action';
import { EventNotice, DetailPlaceholder } from '../../ui/EventStates';
export function SavedScreen() {
  const theme = useTheme();
  const saved = useSaved();
  const router = useRouter();
  const now = useEventClock();
  const offline = useIsOffline();
  const [past, setPast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const active = useRef(false);
  async function refresh() {
    if (active.current || !saved.ready) return;
    active.current = true;
    setRefreshing(true);
    setRefreshError(null);
    const entries = Object.values(saved.store.getSnapshot().entries);
    let failures = 0;
    let missing = 0;
    // Bounded sequential requests; each response carries the membership revision at request start.
    for (const entry of entries) {
      const id = entry.event.id;
      if (!saved.store.getSnapshot().entries[id]) continue;
      const revision = saved.store.revision(id);
      try {
        saved.store.enrich(detailSnapshot(await getEventDetails(id)), revision);
      } catch (error) {
        failures++;
        if (
          error instanceof Error &&
          'code' in error &&
          error.code === 'NOT_FOUND'
        )
          missing++;
      }
    }
    if (failures)
      setRefreshError(
        `${failures} saved event${failures === 1 ? '' : 's'} could not be refreshed.${missing ? ' Current details are unavailable for some events.' : ''} Your saved snapshots were kept.`,
      );
    setRefreshing(false);
    active.current = false;
  }
  const entries = Object.values(saved.entries).sort(sortSnapshots);
  const filtered = entries.filter((s) => {
    const state = temporalState(s, now);
    return past
      ? state === 'ended' || state === 'date-passed'
      : state === 'upcoming' || state === 'undated';
  });
  const dated = filtered.filter((s) => temporalState(s, now) !== 'undated');
  if (past) dated.sort(sortPastSnapshots);
  const undated = filtered.filter((s) => temporalState(s, now) === 'undated');
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
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor={theme.accent}
          />
        }
      >
        <Text
          accessibilityRole="header"
          style={{ fontSize: 36, fontWeight: '600', color: theme.text }}
        >
          Saved
        </Text>
        <Text style={{ color: theme.muted, fontSize: 14, lineHeight: 21 }}>
          Your personal shortlist, stored on this device.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[false, true].map((value) => (
            <Pressable
              key={String(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: past === value }}
              onPress={() => setPast(value)}
              style={{
                minHeight: 48,
                padding: 16,
                borderRadius: 16,
                backgroundColor:
                  past === value ? theme.accentSoft : theme.surface,
              }}
            >
              <Text style={{ fontSize: 16, color: theme.text }}>
                {value ? 'Past' : 'Upcoming'}
              </Text>
            </Pressable>
          ))}
        </View>
        {!saved.ready && !saved.error && <DetailPlaceholder />}
        {saved.error && (
          <EventNotice
            message={saved.error}
            label={saved.ready ? 'Retry saving' : 'Retry loading'}
            onRetry={() => saved.store.retry()}
          />
        )}
        {offline && (
          <EventNotice message="You’re offline. Saved events show last-known information stored on this device." />
        )}
        {refreshError && (
          <EventNotice
            message={refreshError}
            label="Retry refresh"
            onRetry={() => void refresh()}
          />
        )}
        {saved.ready && entries.length === 0 && (
          <>
            <Text style={{ color: theme.text, fontSize: 18 }}>
              Keep something to look forward to. Save events as you explore.
            </Text>
            <Action
              label="Explore Discover"
              onPress={() => router.navigate('/')}
            />
          </>
        )}
        {saved.ready && entries.length > 0 && filtered.length === 0 && (
          <Text style={{ color: theme.text }}>
            No {past ? 'past' : 'upcoming'} saved events.
          </Text>
        )}
        {[
          { title: null, items: dated },
          { title: 'Date to be announced', items: undated },
        ].map((group) => (
          <View key={group.title ?? 'dated'} style={{ gap: 12 }}>
            {group.items.length > 0 && group.title && (
              <Text
                accessibilityRole="header"
                style={{ color: theme.text, fontSize: 22, fontWeight: '600' }}
              >
                {group.title}
              </Text>
            )}
            {group.items.map((snapshot) => (
              <View key={snapshot.event.id}>
                <EventCard
                  event={snapshot.event}
                  schedule={formatSchedule(snapshot.event.schedule)}
                  price={formatPrice(snapshot.event.price)}
                  saved
                  saveReady={saved.ready}
                  onSave={() => saved.store.toggle(snapshot)}
                  onOpen={() =>
                    router.push({
                      pathname: '/event',
                      params: { id: snapshot.event.id },
                    })
                  }
                />
                <Text style={{ color: theme.muted, marginBottom: 16 }}>
                  {snapshot.area.name} ·{' '}
                  {snapshot.details ? 'Last-known details' : 'Summary only'}
                  {past
                    ? ` · ${temporalState(snapshot, now) === 'ended' ? 'Ended' : 'Date passed'}`
                    : ''}
                </Text>
              </View>
            ))}
          </View>
        ))}
        {entries.length > 0 && (
          <Action
            secondary
            label="Refresh saved details"
            onPress={() => void refresh()}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
