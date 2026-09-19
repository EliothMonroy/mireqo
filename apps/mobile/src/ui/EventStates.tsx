import { Text, View } from 'react-native';
import { Action } from './Action';
import { useTheme } from './theme';
export function EventNotice({
  message,
  onRetry,
  label = 'Try again',
}: {
  message: string;
  onRetry?: () => void;
  label?: string;
}) {
  const theme = useTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        padding: 16,
        gap: 12,
        borderRadius: 16,
        backgroundColor: theme.accentSoft,
      }}
    >
      <Text style={{ color: theme.text, fontSize: 14, lineHeight: 21 }}>
        {message}
      </Text>
      {onRetry && <Action secondary label={label} onPress={onRetry} />}
    </View>
  );
}
export function DetailPlaceholder() {
  const theme = useTheme();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading event details"
      accessibilityState={{ busy: true }}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ gap: 20 }}
      >
        <View
          style={{
            height: 240,
            borderRadius: 24,
            backgroundColor: theme.imageFallback,
          }}
        />
        {[90, 60, 80, 45].map((width) => (
          <View
            key={width}
            style={{
              height: 22,
              width: `${width}%`,
              borderRadius: 8,
              backgroundColor: theme.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}
