import { fireEvent, render } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import EventRoute from '../app/event';
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock('../features/event-details/EventDetailsScreen', () => ({
  EventDetailsScreen: ({ id, onBack }: { id: string; onBack: () => void }) => {
    const { Text, Pressable } = jest.requireActual('react-native');
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Detail back"
        onPress={onBack}
      >
        <Text>{id}</Text>
      </Pressable>
    );
  },
}));
test('invalid direct entry has a useful Discover fallback without browsing history', () => {
  const replace = jest.fn();
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: ['wrong', 'array'] });
  jest.mocked(useRouter).mockReturnValue({
    canGoBack: () => false,
    replace,
  } as unknown as ReturnType<typeof useRouter>);
  const view = render(<EventRoute />);
  expect(
    view.getByText(
      'This event link is invalid. Choose an event from Discover.',
    ),
  ).toBeTruthy();
  fireEvent.press(view.getByRole('button', { name: 'Back to Discover' }));
  expect(replace).toHaveBeenCalledWith('/');
});
test('valid ID entry uses stable identity and native history when available', () => {
  const back = jest.fn();
  const replace = jest.fn();
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: 'demo:coacalco:01' });
  jest.mocked(useRouter).mockReturnValue({
    canGoBack: () => true,
    back,
    replace,
  } as unknown as ReturnType<typeof useRouter>);
  const view = render(<EventRoute />);
  expect(view.getByText('demo:coacalco:01')).toBeTruthy();
  fireEvent.press(view.getByRole('button', { name: 'Detail back' }));
  expect(back).toHaveBeenCalledTimes(1);
  expect(replace).not.toHaveBeenCalled();
});
