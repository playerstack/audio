import { renderHook } from '@testing-library/react';
import { useDeepCompareMemoize } from '@hooks/useDeepCompareMemoize';

describe('useDeepCompareMemoize', () => {
  test('returns same reference for equal values', () => {
    const initial = { a: 1, b: [2, 3] };
    const { result, rerender } = renderHook(({ value }) => useDeepCompareMemoize(value), {
      initialProps: { value: initial },
    });
    const firstRef = result.current;

    // Rerender with deeply equal but different reference
    rerender({ value: { a: 1, b: [2, 3] } });
    expect(result.current).toBe(firstRef);
  });

  test('returns new reference when value changes', () => {
    const initial = { a: 1 };
    const { result, rerender } = renderHook(({ value }) => useDeepCompareMemoize(value), {
      initialProps: { value: initial },
    });
    const firstRef = result.current;

    // Rerender with different value
    rerender({ value: { a: 2 } });
    expect(result.current).not.toBe(firstRef);
    expect(result.current).toEqual({ a: 2 });
  });

  test('returns same reference for same primitive', () => {
    const { result, rerender } = renderHook(({ value }) => useDeepCompareMemoize(value), {
      initialProps: { value: 42 },
    });
    rerender({ value: 42 });
    expect(result.current).toBe(42);
  });

  test('updates reference for different primitive', () => {
    const { result, rerender } = renderHook(({ value }) => useDeepCompareMemoize(value), {
      initialProps: { value: 'hello' },
    });
    rerender({ value: 'world' });
    expect(result.current).toBe('world');
  });

  test('handles null/undefined transitions', () => {
    const { result, rerender } = renderHook(({ value }) => useDeepCompareMemoize(value), {
      initialProps: { value: null },
    });
    expect(result.current).toBeNull();

    rerender({ value: undefined });
    expect(result.current).toBeUndefined();

    rerender({ value: { x: 1 } });
    expect(result.current).toEqual({ x: 1 });
  });

  test('handles array comparison', () => {
    const { result, rerender } = renderHook(({ value }) => useDeepCompareMemoize(value), {
      initialProps: { value: [1, 2, 3] },
    });
    const firstRef = result.current;
    rerender({ value: [1, 2, 3] }); // equal
    expect(result.current).toBe(firstRef);

    rerender({ value: [1, 2, 4] }); // different
    expect(result.current).toEqual([1, 2, 4]);
  });
});
