import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from '../../src/context/index';
import { useAppDispatch } from '../../src/context/index';

describe('useAppDispatch', () => {
  const wrapper = ({ children }) => (
    <Provider language="en">{children}</Provider>
  );

  test('returns a function', () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    expect(typeof result.current).toBe('function');
  });

  test('dispatches plain object action', () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    act(() => {
      result.current({ menuVisible: true });
    });
    // No error means success
  });

  test('dispatches function action (thunk-like)', () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    const thunk = jest.fn((state) => ({ menuVisible: !state.menuVisible }));
    act(() => {
      result.current(thunk);
    });
    expect(thunk).toHaveBeenCalled();
    const stateArg = thunk.mock.calls[0][0];
    expect(stateArg).toHaveProperty('menuVisible');
  });

  test('dispatch identity is stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useAppDispatch(), { wrapper });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
