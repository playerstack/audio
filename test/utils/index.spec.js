import { omit } from '../../src/utils/index';

describe('omit', () => {
  test('removes specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(omit(obj, ['a', 'c'])).toEqual({ b: 2 });
  });

  test('accepts multiple arrays (variadic)', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    expect(omit(obj, ['a'], ['c'])).toEqual({ b: 2, d: 4 });
  });

  test('returns all keys when none omitted', () => {
    const obj = { x: 10, y: 20 };
    expect(omit(obj, [])).toEqual({ x: 10, y: 20 });
  });

  test('handles non-existent keys gracefully', () => {
    const obj = { a: 1 };
    expect(omit(obj, ['z'])).toEqual({ a: 1 });
  });
});
