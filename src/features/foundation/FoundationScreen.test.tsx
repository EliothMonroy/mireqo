import { render, screen } from '@testing-library/react-native';
import FoundationScreen from './FoundationScreen';

it('provides an accessible launch heading and honest foundation status', () => {
  render(<FoundationScreen />);
  expect(screen.getByRole('header', { name: 'Mireqo' })).toBeOnTheScreen();
  expect(screen.getByText('The foundation is ready.')).toBeOnTheScreen();
  expect(screen.getByText('Event discovery is coming next.')).toBeOnTheScreen();
});
