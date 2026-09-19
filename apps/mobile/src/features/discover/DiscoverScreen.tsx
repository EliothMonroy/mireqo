import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DiscoverySession } from '../../data/discovery-session';
import type { DiscoveryScope } from '../../data/discovery-catalog';
import { categories, collections } from '../../domain/discovery-filters';
import { formatReferenceDate } from '../../domain/event-format';
import { useTheme } from '../../ui/theme';
import {
  DateChoices,
  EventCardPlaceholders,
  Notice,
  discoveryStyles as styles,
} from './DiscoveryParts';
import { DiscoverySection } from './DiscoverySection';
export function DiscoverScreen({
  data,
  onChangeArea,
  onOpen,
}: {
  data: DiscoverySession;
  onChangeArea: () => void;
  onOpen: (scope: DiscoveryScope) => void;
}) {
  const theme = useTheme();
  const context = data.context;
  const scope: DiscoveryScope | null =
    data.selectedArea && context
      ? {
          areaId: data.selectedArea.id,
          context: context.context.token,
          date: data.date,
        }
      : null;
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <ScrollView
        key={`${data.selectedArea?.id}:${data.date}`}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={data.refreshing}
            onRefresh={data.refresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      >
        <Text style={[local.brand, { color: theme.accent }]}>MIREQO</Text>
        <Text
          accessibilityRole="header"
          maxFontSizeMultiplier={1.6}
          style={[styles.title, { color: theme.text }]}
        >
          Discover
        </Text>
        <Text style={[styles.copy, { color: theme.muted, marginVertical: 8 }]}>
          A little closer to what’s on.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Change area, currently ${data.selectedArea?.name}`}
          onPress={onChangeArea}
          style={[local.location, { backgroundColor: theme.accentSoft }]}
        >
          <Text style={[local.locationText, { color: theme.text }]}>
            {data.selectedArea?.name} ⌄
          </Text>
        </Pressable>
        <DateChoices value={data.date} onChange={data.setDate} />
        {data.persistenceError && (
          <Notice
            message={data.persistenceError}
            label="Retry saving area"
            onPress={data.retryPersistence}
          />
        )}
        {data.isOffline && (
          <Notice message="You’re offline. Previously loaded events remain available in this session." />
        )}
        {data.contextError && (
          <Notice
            message={`${context ? `Showing the browsing snapshot from ${context.context.localDate}. ` : ''}${data.contextError}`}
            label="Try again"
            onPress={data.refresh}
          />
        )}
        <View style={[local.demo, { borderColor: theme.border }]}>
          <Text style={[local.demoTitle, { color: theme.text }]}>
            Demo events
          </Text>
          <Text style={[styles.copy, { color: theme.muted }]}>
            These are imagined events, not real listings.
            {context
              ? ` Sample catalog: ${formatReferenceDate(context.demo.referenceDate)}.`
              : ''}
          </Text>
        </View>
        <Text
          accessibilityRole="header"
          style={[styles.heading, { color: theme.text, marginTop: 24 }]}
        >
          Find your kind of day
        </Text>
        <View style={local.categories}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              accessibilityLabel={`Browse ${category.label}`}
              accessibilityState={{ disabled: !scope }}
              disabled={!scope}
              onPress={() =>
                scope && onOpen({ ...scope, category: category.id })
              }
              style={[
                local.category,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
            >
              <Text
                style={{ color: theme.text, fontWeight: '600', fontSize: 15 }}
              >
                {category.label} ↗
              </Text>
            </Pressable>
          ))}
        </View>
        {data.contextLoading && (
          <EventCardPlaceholders label="Preparing discovery" />
        )}
        {scope && (
          <View key={`${scope.areaId}:${scope.date}`}>
            <DiscoverySection
              scope={scope}
              title={
                data.date === 'default' ? 'All upcoming events' : 'All events'
              }
              general
              onOpen={onOpen}
              onRestart={data.refresh}
              onEmptyRecovery={
                data.date === 'default'
                  ? onChangeArea
                  : () => data.setDate('default')
              }
            />
            {collections
              .filter(
                (collection) =>
                  data.date === 'default' ||
                  (collection.id !== 'today' && collection.id !== 'weekend'),
              )
              .map((collection) => (
                <DiscoverySection
                  key={collection.id}
                  scope={{ ...scope, collection: collection.id }}
                  title={collection.label}
                  onOpen={onOpen}
                  onRestart={data.refresh}
                  onEmptyRecovery={onChangeArea}
                />
              ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const local = StyleSheet.create({
  brand: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  location: { minHeight: 48, padding: 14, borderRadius: 16, marginTop: 12 },
  locationText: { fontSize: 18, fontWeight: '600' },
  demo: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 16,
    gap: 6,
  },
  demoTitle: { fontSize: 14, fontWeight: '700' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  category: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'center',
  },
});
