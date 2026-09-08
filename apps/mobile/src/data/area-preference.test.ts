import {
  createAreaPreference,
  type AreaPreferenceStorage,
} from './area-preference';
function storage(initial: string | null = null): AreaPreferenceStorage {
  let current = initial;
  return {
    initialize: jest.fn(async () => {}),
    read: jest.fn(async () => current),
    write: jest.fn(async (value) => {
      current = value;
    }),
  };
}
test('hydrates before a choice and restores the persisted area', async () => {
  const disk = storage('tultitlan');
  const store = createAreaPreference(disk);
  expect(store.getSnapshot().hydrating).toBe(true);
  await store.hydrate();
  expect(store.getSnapshot()).toEqual({
    areaId: 'tultitlan',
    hydrating: false,
    error: null,
  });
  expect(disk.write).not.toHaveBeenCalled();
});
test('rapid writes serialize and the last intent survives restart', async () => {
  const disk = storage();
  const store = createAreaPreference(disk);
  await store.hydrate();
  store.select('coacalco');
  store.select('tultitlan');
  store.select('mexico-city');
  expect(store.getSnapshot().areaId).toBe('mexico-city');
  await store.settled();
  const restarted = createAreaPreference(disk);
  await restarted.hydrate();
  expect(restarted.getSnapshot().areaId).toBe('mexico-city');
  expect(disk.write).toHaveBeenNthCalledWith(1, 'coacalco');
  expect(disk.write).toHaveBeenNthCalledWith(3, 'mexico-city');
});
test('an older failed write cannot overwrite a newer intent; latest failure can retry', async () => {
  const disk = storage();
  const write = jest.spyOn(disk, 'write');
  const store = createAreaPreference(disk);
  await store.hydrate();
  write.mockRejectedValueOnce(new Error('disk full'));
  store.select('coacalco');
  store.select('tultitlan');
  await store.settled();
  expect(store.getSnapshot().error).toBeNull();
  write.mockRejectedValueOnce(new Error('disk full'));
  store.select('mexico-city');
  await store.settled();
  expect(store.getSnapshot().error).toMatch('could not be saved');
  store.retry();
  await store.settled();
  expect(store.getSnapshot().error).toBeNull();
  expect(await disk.read()).toBe('mexico-city');
});
test('failed migration blocks writes, surfaces error and retries hydration', async () => {
  const disk = storage('coacalco');
  jest.spyOn(disk, 'initialize').mockRejectedValueOnce(new Error('locked'));
  const store = createAreaPreference(disk);
  await store.hydrate();
  store.select('mexico-city');
  expect(disk.write).not.toHaveBeenCalled();
  expect(store.getSnapshot().error).toMatch('could not be restored');
  await store.hydrate();
  expect(store.getSnapshot().areaId).toBe('coacalco');
  expect(store.getSnapshot().error).toBeNull();
});
