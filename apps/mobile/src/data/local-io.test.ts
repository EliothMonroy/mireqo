import { serializeLocalIO } from './local-io';
test('local adapters cannot overlap exclusive transactions and recover after failure', async () => {
  let finish!: () => void;
  const order: string[] = [];
  const first = serializeLocalIO(async () => {
    order.push('preference migration');
    await new Promise<void>((resolve) => {
      finish = resolve;
    });
    throw new Error('disk');
  });
  const second = serializeLocalIO(async () => {
    order.push('saved migration');
    return 1;
  });
  await Promise.resolve();
  expect(order).toEqual(['preference migration']);
  finish();
  await expect(first).rejects.toThrow('disk');
  await expect(second).resolves.toBe(1);
  expect(order).toEqual(['preference migration', 'saved migration']);
});
