import { ScrollView, StyleSheet, Text, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/ui/theme';

export default function FoundationScreen() {
  const palette = colors[useColorScheme() === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: palette.text }]}
        >
          Mireqo
        </Text>
        <Text style={[styles.body, { color: palette.text }]}>
          The foundation is ready.
        </Text>
        <Text style={[styles.body, { color: palette.text }]}>
          Event discovery is coming next.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontSize: 36, fontWeight: '700' },
  body: { fontSize: 18 },
});
