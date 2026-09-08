import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { EventSummary } from '@mireqo/contracts';
import { useTheme } from './theme';
const artwork = {
  music: require('../../assets/catalog/music.png'),
  market: require('../../assets/catalog/market.png'),
  art: require('../../assets/catalog/art.png'),
  outdoors: require('../../assets/catalog/outdoors.png'),
};
export function EventCard({
  event,
  schedule,
  price,
}: {
  event: EventSummary;
  schedule: string;
  price: string | null;
}) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const source =
    event.image?.kind === 'artwork'
      ? artwork[event.image.key]
      : event.image?.kind === 'remote'
        ? { uri: event.image.url }
        : undefined;
  const location = [event.venue, event.neighborhood]
    .filter(Boolean)
    .join(' · ');
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={[styles.visual, { backgroundColor: theme.imageFallback }]}>
        {source && !failed ? (
          <Image
            source={source}
            onError={() => setFailed(true)}
            style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
            resizeMode="cover"
            accessible={false}
          />
        ) : (
          <View style={styles.fallback}>
            <View style={[styles.orbit, { borderColor: theme.muted }]} />
            <Text style={[styles.fallbackText, { color: theme.muted }]}>
              Event image unavailable
            </Text>
          </View>
        )}
        {event.category && (
          <View style={[styles.category, { backgroundColor: theme.surface }]}>
            <Text style={[styles.categoryText, { color: theme.text }]}>
              {event.category}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={[styles.schedule, { color: theme.accent }]}>
          {schedule}
        </Text>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: theme.text }]}
        >
          {event.title}
        </Text>
        {location ? (
          <Text style={[styles.location, { color: theme.muted }]}>
            {location}
          </Text>
        ) : (
          <Text style={[styles.location, { color: theme.muted }]}>
            Venue to be announced
          </Text>
        )}
        {(price || event.status !== 'scheduled') && (
          <View style={styles.bottom}>
            {price && (
              <Text style={[styles.price, { color: theme.text }]}>{price}</Text>
            )}
            {event.status !== 'scheduled' && (
              <Text style={[styles.status, { color: theme.danger }]}>
                {event.status === 'cancelled' ? 'Cancelled' : 'Postponed'}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 24,
  },
  visual: { height: 200, overflow: 'hidden' },
  category: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    maxWidth: '85%',
  },
  categoryText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  body: { padding: 20, gap: 10 },
  schedule: { fontSize: 13, fontWeight: '700', lineHeight: 20 },
  title: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  location: { fontSize: 14, lineHeight: 22 },
  bottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    paddingTop: 5,
  },
  price: { fontSize: 15, fontWeight: '600' },
  status: { fontSize: 14, fontWeight: '700' },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  orbit: {
    width: 65,
    height: 65,
    borderRadius: 40,
    borderWidth: 1,
    transform: [{ rotate: '-25deg' }, { scaleX: 1.6 }],
  },
  fallbackText: { fontSize: 13 },
});
