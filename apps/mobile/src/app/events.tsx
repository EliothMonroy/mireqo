import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { parseDiscoveryRoute } from '../domain/discovery-filters';
import { EventListScreen } from '../features/discover/EventListScreen';
import { Action } from '../ui/Action';
import { useTheme } from '../ui/theme';
export default function EventsRoute() {
  const params = useLocalSearchParams();
  const scope = parseDiscoveryRoute(params);
  const router = useRouter();
  const theme = useTheme();
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  if (!scope)
    return (
      <View
        style={{
          flex: 1,
          padding: 24,
          justifyContent: 'center',
          gap: 20,
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: theme.text }}>
          This event selection is no longer available. Choose a new selection
          from Discover.
        </Text>
        <Action label="Back to Discover" onPress={back} />
      </View>
    );
  return (
    <EventListScreen
      key={JSON.stringify(scope)}
      initialScope={scope}
      onBack={back}
    />
  );
}
