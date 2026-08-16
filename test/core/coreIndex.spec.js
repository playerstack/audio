import playerCore from '../../src/core/index';

describe('core/index', () => {
  test('exports key, name, canPlay, lazyPlayer', () => {
    expect(playerCore.key).toBe('core');
    expect(playerCore.name).toBe('PlayerCore');
    expect(typeof playerCore.canPlay).toBe('function');
    expect(playerCore.lazyPlayer).toBeDefined();
  });

  test('canPlay returns true (mocked)', () => {
    expect(playerCore.canPlay('test.mp3')).toBe(true);
  });
});
