import { createTypedReducer } from '@playerstack/core';
import { actionTypes } from '@context/index';

const reducer = createTypedReducer(actionTypes);

describe('AppReducer', () => {
  const initial = { menuVisible: false, playerRef: null, videoRef: null, i18n: {} };

  test('actionTypes contains expected types', () => {
    expect(actionTypes).toContain('i18n');
    expect(actionTypes).toContain('menuVisible');
    expect(actionTypes).toContain('videoRef');
    expect(actionTypes).toContain('playerRef');
  });

  test('handles typed action', () => {
    const result = reducer(initial, { type: 'menuVisible', payload: true });
    expect(result.menuVisible).toBe(true);
  });

  test('bails out if value unchanged', () => {
    const result = reducer(initial, { type: 'menuVisible', payload: false });
    expect(result).toBe(initial);
  });

  test('handles object merge action', () => {
    const result = reducer(initial, { menuVisible: true, playerRef: 'ref' });
    expect(result.menuVisible).toBe(true);
    expect(result.playerRef).toBe('ref');
  });

  test('returns same ref for object merge with no changes', () => {
    const result = reducer(initial, { menuVisible: false });
    expect(result).toBe(initial);
  });

  test('handles function action', () => {
    const result = reducer(initial, (state) => ({ menuVisible: !state.menuVisible }));
    expect(result.menuVisible).toBe(true);
  });

  test('returns state for invalid type', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const result = reducer(initial, { type: 'invalid', payload: true });
    expect(result).toBe(initial);
    consoleSpy.mockRestore();
  });

  test('returns state for null action', () => {
    const result = reducer(initial, null);
    expect(result).toBe(initial);
  });

  test('returns state for empty object', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const result = reducer(initial, {});
    expect(result).toBe(initial);
    consoleSpy.mockRestore();
  });

  test('returns state for function returning null', () => {
    const result = reducer(initial, () => null);
    expect(result).toBe(initial);
  });
});
