import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSaved } from '../../data/saved-context';
import { summarySnapshot, type EventSnapshot } from '../../domain/saved-event';
import type {
  Area,
  EventsResponse,
  DiscoveryDate,
  EventSummary,
} from '@mireqo/contracts';
import { dates } from '../../domain/discovery-filters';
import { formatPrice, formatSchedule } from '../../domain/event-format';
import { Action } from '../../ui/Action';
import { EventCard } from '../../ui/EventCard';
import { useTheme } from '../../ui/theme';
export function Notice({
  message,
  label,
  onPress,
}: {
  message: string;
  label?: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.notice, { backgroundColor: theme.accentSoft }]}
    >
      <Text style={[styles.copy, { color: theme.text }]}>{message}</Text>
      {label && onPress && <Action secondary label={label} onPress={onPress} />}
    </View>
  );
}
export function Loading({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.loading}>
      <ActivityIndicator accessibilityLabel={label} color={theme.accent} />
      <Text style={{ color: theme.muted }}>{label}</Text>
    </View>
  );
}
// Initial content keeps the same image/title/metadata shape as an event card.
// Decorative blocks are hidden from accessibility; one busy announcement
// describes the section without pretending that placeholder events exist.
export function EventCardPlaceholders({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {[0, 1].map((key) => (
          <View
            key={key}
            testID="event-card-placeholder"
            style={[
              styles.placeholder,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              testID="event-image-placeholder"
              style={[
                styles.placeholderImage,
                { backgroundColor: theme.imageFallback },
              ]}
            />
            <View
              testID="event-title-placeholder"
              style={[
                styles.placeholderLine,
                { backgroundColor: theme.border },
              ]}
            />
            <View
              testID="event-metadata-placeholder"
              style={[
                styles.placeholderLine,
                { width: '45%', backgroundColor: theme.border },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
export function DateChoices({
  value,
  onChange,
}: {
  value: DiscoveryDate;
  onChange: (date: DiscoveryDate) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.chips}>
      {dates.map((date) => (
        <Pressable
          key={date.id}
          accessibilityRole="button"
          accessibilityLabel={
            date.id === 'default'
              ? 'Reset date to upcoming'
              : `Date: ${date.label}`
          }
          accessibilityState={{ selected: date.id === value }}
          onPress={() => onChange(date.id)}
          style={[
            styles.chip,
            {
              backgroundColor: value === date.id ? theme.accent : theme.surface,
              borderColor: value === date.id ? theme.accent : theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.chipText,
              { color: value === date.id ? theme.background : theme.text },
            ]}
          >
            {date.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export function Card({
  event,
  area,
  demo,
}: {
  event: EventSummary;
  area?: Area;
  demo?: EventsResponse['demo'];
}) {
  const router = useRouter();
  const saved = useSaved();
  const client = useQueryClient();
  const snapshot = area && demo ? summarySnapshot(event, area, demo) : null;
  const open = () => {
    if (snapshot && !client.getQueryData(['event-details', event.id]))
      client.setQueryData(['event-preview', event.id], snapshot);
    router.push({ pathname: '/event', params: { id: event.id } });
  };
  return (
    <View>
      {saved.error && (
        <Notice
          message={saved.error}
          label={saved.ready ? 'Retry saving' : 'Retry loading'}
          onPress={() => saved.store.retry()}
        />
      )}
      <EventCard
        event={event}
        onOpen={open}
        saved={!!saved.entries[event.id]}
        saveReady={saved.ready}
        onSave={
          snapshot
            ? () =>
                saved.store.toggle(
                  client.getQueryData<EventSnapshot>([
                    'event-details',
                    event.id,
                  ]) ?? snapshot,
                )
            : undefined
        }
        schedule={formatSchedule(event.schedule)}
        price={formatPrice(event.price)}
      />
    </View>
  );
}
export const discoveryStyles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  title: { fontSize: 36, fontWeight: '600', letterSpacing: -1.2 },
  heading: { fontSize: 24, fontWeight: '600', letterSpacing: -0.6 },
  copy: { fontSize: 14, lineHeight: 21 },
  section: { marginTop: 30, gap: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  gap: { gap: 12 },
  footer: { gap: 12, marginTop: 24 },
});
const styles = StyleSheet.create({
  notice: { borderRadius: 16, padding: 16, gap: 12, marginVertical: 8 },
  copy: { fontSize: 14, lineHeight: 21 },
  loading: { padding: 24, gap: 12, alignItems: 'center' },
  placeholder: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    paddingBottom: 24,
  },
  placeholderImage: { height: 200, marginBottom: 24 },
  placeholderLine: {
    height: 16,
    width: '75%',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 5,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 16,
  },
  chip: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
  },
  chipText: { fontSize: 14, fontWeight: '600' },
});
