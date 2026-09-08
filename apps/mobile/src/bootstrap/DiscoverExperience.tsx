import { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { useDiscoverData } from '../data/discover';
import { DiscoverScreen } from '../features/discover/DiscoverScreen';
import { LocationSelector } from '../features/location/LocationSelector';
import { useTheme } from '../ui/theme';
export function DiscoverExperience() {
  const data = useDiscoverData();
  const theme = useTheme();
  const [choosingArea, setChoosingArea] = useState(false);
  if (data.hydrating)
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator
          accessibilityLabel="Restoring your area"
          color={theme.accent}
        />
      </View>
    );
  const selector = (
    <LocationSelector
      areas={data.areas}
      selectedId={data.selectedArea?.id}
      loading={data.areasLoading}
      error={data.areasError}
      persistenceError={data.persistenceError}
      onRetryPersistence={data.retryPersistence}
      onRetry={data.retryAreas}
      onSelect={(id) => {
        data.selectArea(id);
        setChoosingArea(false);
      }}
      onClose={data.selectedArea ? () => setChoosingArea(false) : undefined}
    />
  );
  if (!data.selectedArea) return selector;
  return (
    <>
      <DiscoverScreen data={data} onChangeArea={() => setChoosingArea(true)} />
      <Modal
        visible={choosingArea}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChoosingArea(false)}
      >
        {selector}
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
