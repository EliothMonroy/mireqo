import { render, fireEvent } from '@testing-library/react-native';
import { EventCard } from './EventCard';
import { page } from '../test/discovery-fixtures';
const event = page({ areaId: 'coacalco', context: 'x', date: 'default' }, 'one')
  .items[0]!;
test('save and open controls are independent, selected and blocked until hydration', () => {
  const open = jest.fn();
  const save = jest.fn();
  const view = render(
    <EventCard
      event={event}
      schedule="Date to be announced"
      price={null}
      onOpen={open}
      onSave={save}
      saved
    />,
  );
  fireEvent.press(view.getByRole('button', { name: 'Remove one from Saved' }));
  expect(save).toHaveBeenCalledTimes(1);
  expect(open).not.toHaveBeenCalled();
  expect(
    view.getByRole('button', { name: 'Remove one from Saved' }).props
      .accessibilityState.selected,
  ).toBe(true);
  fireEvent.press(view.getByRole('button', { name: 'Open one' }));
  expect(open).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledTimes(1);
  view.rerender(
    <EventCard
      event={event}
      schedule="Date to be announced"
      price={null}
      onSave={save}
      saveReady={false}
    />,
  );
  fireEvent.press(view.getByRole('button', { name: 'Save one' }));
  expect(save).toHaveBeenCalledTimes(1);
});
