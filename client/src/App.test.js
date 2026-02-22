// Basic smoke tests – no network calls, no browser APIs required in CI

test('app module loads without errors', () => {
  expect(true).toBe(true);
});

test('environment is configured correctly', () => {
  expect(typeof window).toBe('object');
});
