import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { EventDetailsScreen } from '../features/event-details/EventDetailsScreen';
import { validEventId } from '../domain/saved-event';
import { Action } from '../ui/Action';
import { useTheme } from '../ui/theme';
export default function EventRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  if (!validEventId(id))
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: 24,
          gap: 20,
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ color: theme.text }}>
          This event link is invalid. Choose an event from Discover.
        </Text>
        <Action label="Back to Discover" onPress={back} />
      </View>
    );
  return <EventDetailsScreen key={id} id={id} onBack={back} />;
}
