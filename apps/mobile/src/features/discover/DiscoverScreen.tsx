import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DiscoverData } from '../../data/discover';
import {
  formatPrice,
  formatReferenceDate,
  formatSchedule,
} from '../../domain/event-format';
import { Action } from '../../ui/Action';
import { EventCard } from '../../ui/EventCard';
import { useTheme } from '../../ui/theme';
export function DiscoverScreen({
  data,
  onChangeArea,
}: {
  data: DiscoverData;
  onChangeArea: () => void;
}) {
  const theme = useTheme();
  const hasContent = data.events.length > 0;
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerRow}>
          <Text
            maxFontSizeMultiplier={1.6}
            style={[styles.brand, { color: theme.accent }]}
          >
            MIREQO
          </Text>
          <Text
            maxFontSizeMultiplier={1.6}
            style={[styles.edition, { color: theme.muted }]}
          >
            A little closer to what’s on.
          </Text>
        </View>
        <Text
          accessibilityRole="header"
          maxFontSizeMultiplier={1.6}
          style={[styles.title, { color: theme.text }]}
        >
          Discover
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Change area, currently ${data.selectedArea?.name}`}
          onPress={onChangeArea}
          style={({ pressed }) => [
            styles.location,
            { backgroundColor: theme.accentSoft, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.locationText, { color: theme.text }]}>
            {data.selectedArea?.name}
          </Text>
          <Text
            accessible={false}
            style={{ color: theme.accent, fontSize: 20 }}
          >
            ⌄
          </Text>
        </Pressable>
      </View>
      <FlatList
        key={data.selectedArea?.id}
        data={data.events}
        keyExtractor={(event) => event.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            schedule={formatSchedule(item.schedule)}
            price={formatPrice(item.price)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={data.refreshing}
            onRefresh={data.refresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={[styles.demo, { borderColor: theme.border }]}>
              <View style={styles.demoHeading}>
                <View style={[styles.dot, { backgroundColor: theme.accent }]} />
                <Text style={[styles.demoTitle, { color: theme.text }]}>
                  Demo events
                </Text>
              </View>
              <Text style={[styles.demoText, { color: theme.muted }]}>
                Imagined events. Real possibilities to explore.
                {data.demo
                  ? ` Sample catalog: ${formatReferenceDate(data.demo.referenceDate)}.`
                  : ''}{' '}
                These are not real listings.
              </Text>
            </View>
            {data.persistenceError && (
              <Notice
                message={data.persistenceError}
                label="Retry saving area"
                onPress={data.retryPersistence}
              />
            )}
            {data.isOffline && (
              <Notice
                message={
                  hasContent
                    ? 'You’re offline. Showing events loaded earlier in this session.'
                    : 'You’re offline. Connect to load demonstration events.'
                }
              />
            )}
            {data.error && (
              <Notice
                message={
                  hasContent
                    ? `Showing previously loaded events. ${data.error}`
                    : data.error
                }
                label="Try again"
                onPress={data.refresh}
              />
            )}
            <View style={styles.sectionHeading}>
              <Text
                accessibilityRole="header"
                style={[styles.sectionTitle, { color: theme.text }]}
              >
                A change of pace
              </Text>
              <Text style={[styles.sectionMeta, { color: theme.muted }]}>
                IN YOUR AREA
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          data.initialLoading ? (
            <View
              accessibilityLabel="Loading events"
              accessibilityRole="progressbar"
            >
              {[0, 1].map((key) => (
                <View
                  key={key}
                  style={[
                    styles.skeleton,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.skeletonImage,
                      { backgroundColor: theme.imageFallback },
                    ]}
                  />
                  <View
                    style={[
                      styles.skeletonLine,
                      { backgroundColor: theme.border },
                    ]}
                  />
                  <View
                    style={[
                      styles.skeletonLine,
                      { width: '45%', backgroundColor: theme.border },
                    ]}
                  />
                </View>
              ))}
            </View>
          ) : !data.error && !data.isOffline ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                A quiet corner, for now.
              </Text>
              <Text style={[styles.emptyText, { color: theme.muted }]}>
                There are no demo events in this area. Explore another place or
                check again.
              </Text>
              <Action label="Change area" onPress={onChangeArea} />
              <Action secondary label="Refresh events" onPress={data.refresh} />
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {data.loadingMore ? (
              <ActivityIndicator
                accessibilityLabel="Loading more events"
                color={theme.accent}
              />
            ) : data.paginationError ? (
              <Notice
                message={data.paginationError}
                label="Retry loading more"
                onPress={data.loadMore}
              />
            ) : data.hasMore ? (
              <Action
                secondary
                label="Explore more events"
                onPress={data.loadMore}
              />
            ) : hasContent ? (
              <Text style={[styles.end, { color: theme.muted }]}>
                You’ve explored this area’s demo events.
              </Text>
            ) : null}
            {hasContent && (
              <Action secondary label="Refresh events" onPress={data.refresh} />
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}
function Notice({
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
      <Text style={[styles.noticeText, { color: theme.text }]}>{message}</Text>
      {label && onPress && <Action secondary label={label} onPress={onPress} />}
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomWidth: 1,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: { fontSize: 12, fontWeight: '800', letterSpacing: 2.5 },
  edition: { fontSize: 11 },
  title: {
    fontSize: 36,
    fontWeight: '600',
    letterSpacing: -1.3,
    marginBottom: 12,
  },
  location: {
    flexDirection: 'row',
    gap: 16,
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    minHeight: 48,
    borderRadius: 16,
    maxWidth: '100%',
  },
  locationText: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  demo: { paddingVertical: 20, gap: 8, borderBottomWidth: 1, marginBottom: 24 },
  demoHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  demoTitle: { fontSize: 13, fontWeight: '700' },
  demoText: { fontSize: 12, lineHeight: 19 },
  sectionHeading: { marginBottom: 18, gap: 6 },
  sectionTitle: { fontSize: 23, fontWeight: '500', letterSpacing: -0.4 },
  sectionMeta: { fontSize: 10, letterSpacing: 1.5, fontWeight: '600' },
  notice: { padding: 16, borderRadius: 16, marginBottom: 18, gap: 12 },
  noticeText: { fontSize: 14, lineHeight: 22 },
  empty: { paddingVertical: 32, gap: 18 },
  emptyTitle: { fontSize: 25, fontWeight: '600' },
  emptyText: { fontSize: 16, lineHeight: 25 },
  skeleton: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    paddingBottom: 24,
  },
  skeletonImage: { height: 200, marginBottom: 24 },
  skeletonLine: {
    height: 16,
    width: '75%',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 5,
  },
  footer: { paddingTop: 4, gap: 16 },
  end: { fontSize: 13, lineHeight: 20, textAlign: 'center', padding: 16 },
});
