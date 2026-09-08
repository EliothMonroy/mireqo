import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Area } from '@mireqo/contracts';
import { useTheme } from '../../ui/theme';
import { Action } from '../../ui/Action';
export interface LocationSelectorProps {
  areas: Area[];
  selectedId?: string;
  loading: boolean;
  error: string | null;
  persistenceError: string | null;
  onRetryPersistence: () => void;
  onSelect: (areaId: string) => void;
  onRetry: () => void;
  onClose?: () => void;
}
export function LocationSelector({
  areas,
  selectedId,
  loading,
  error,
  persistenceError,
  onRetryPersistence,
  onSelect,
  onRetry,
  onClose,
}: LocationSelectorProps) {
  const theme = useTheme();
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <Text style={[styles.brand, { color: theme.accent }]}>MIREQO</Text>
          {onClose && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close area selection"
              onPress={onClose}
              style={styles.close}
            >
              <Text style={{ color: theme.text, fontSize: 16 }}>Close</Text>
            </Pressable>
          )}
        </View>
        {!onClose && (
          <Image
            accessible={false}
            source={require('../../../assets/catalog/market.png')}
            style={styles.hero}
          />
        )}
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: theme.text }]}
        >
          {onClose ? 'A change of scene.' : 'Good things\nare close by.'}
        </Text>
        <Text style={[styles.description, { color: theme.muted }]}>
          Choose an area to explore. No account or location permission needed.
        </Text>
        <Text style={[styles.eyebrow, { color: theme.accent }]}>
          WHERE SHALL WE GO?
        </Text>
        {loading && (
          <ActivityIndicator
            accessibilityLabel="Loading supported areas"
            color={theme.accent}
          />
        )}
        {error && (
          <View style={styles.notice}>
            <Text style={{ color: theme.text }}>{error}</Text>
            <Action label="Try loading areas again" onPress={onRetry} />
          </View>
        )}
        {persistenceError && (
          <View style={styles.notice}>
            <Text style={{ color: theme.danger }}>{persistenceError}</Text>
            <Action
              label="Retry local preferences"
              onPress={onRetryPersistence}
            />
          </View>
        )}
        {areas.map((area, index) => (
          <Pressable
            key={area.id}
            accessibilityRole="button"
            accessibilityLabel={`Choose ${area.name}, ${area.administrativeContext}`}
            accessibilityState={{ selected: area.id === selectedId }}
            onPress={() => onSelect(area.id)}
            style={({ pressed }) => [
              styles.area,
              {
                backgroundColor:
                  area.id === selectedId ? theme.accentSoft : theme.surface,
                borderColor: theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View
              style={[styles.number, { backgroundColor: theme.background }]}
            >
              <Text style={[styles.numberText, { color: theme.accent }]}>
                {String(index + 1).padStart(2, '0')}
              </Text>
            </View>
            <View style={styles.areaText}>
              <Text style={[styles.areaName, { color: theme.text }]}>
                {area.name}
              </Text>
              <Text style={[styles.context, { color: theme.muted }]}>
                {area.administrativeContext}
              </Text>
            </View>
            <Text
              accessibilityElementsHidden
              style={[styles.arrow, { color: theme.accent }]}
            >
              {area.id === selectedId ? '✓' : '↗'}
            </Text>
          </Pressable>
        ))}
        <View style={[styles.demo, { borderColor: theme.border }]}>
          <Text style={[styles.demoTitle, { color: theme.text }]}>
            A first look at Mireqo
          </Text>
          <Text style={[styles.demoText, { color: theme.muted }]}>
            You’ll be browsing demonstration events, created to explore the
            experience. These are not real event listings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    padding: 24,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingBottom: 40,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brand: { fontSize: 14, fontWeight: '800', letterSpacing: 3 },
  close: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: { width: '100%', height: 165, borderRadius: 24, marginBottom: 28 },
  title: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1.2,
    fontWeight: '600',
    marginBottom: 14,
  },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 28 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 14,
  },
  area: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  number: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { fontSize: 12, fontWeight: '600' },
  areaText: { flex: 1, gap: 4 },
  areaName: { fontSize: 20, fontWeight: '600', letterSpacing: -0.3 },
  context: { fontSize: 13, lineHeight: 18 },
  arrow: { fontSize: 22 },
  demo: { borderTopWidth: 1, marginTop: 24, paddingTop: 22, gap: 8 },
  demoTitle: { fontSize: 14, fontWeight: '600' },
  demoText: { fontSize: 13, lineHeight: 20 },
  notice: { gap: 12, marginBottom: 16 },
});
