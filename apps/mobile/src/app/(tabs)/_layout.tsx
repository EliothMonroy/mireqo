import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '../../ui/theme';
export default function MainTabs() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        tabBarLabelStyle: { fontSize: 14 },
        tabBarItemStyle: { minHeight: 48 },
      }}
    >
      <Tabs.Screen
        name="(discover)"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>◇</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>♡</Text>
          ),
        }}
      />
    </Tabs>
  );
}
