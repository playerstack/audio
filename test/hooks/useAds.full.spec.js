import React from 'react';
import { renderHook, act } from '@testing-library/react';

const useAds = require('../../src/hooks/useAds').default;

describe('useAds — full coverage', () => {
  const baseParams = {
    ads: null,
    currentTime: 0,
    duration: 100,
    paused: true,
    ended: false,
    onPauseClick: jest.fn(),
  };

  test('inactive when ads is null', () => {
    const { result } = renderHook(() => useAds(baseParams));
    expect(result.current.isAdActive).toBe(false);
    expect(result.current.hasSkipTimer).toBe(false);
    expect(result.current.canSkip).toBe(false);
    expect(result.current.skipCountdown).toBe(0);
    expect(result.current.adProgress).toBe(0);
  });

  test('activates immediately when not paused on mount', () => {
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: { skipAfter: 5 }, paused: false }),
    );
    expect(result.current.isAdActive).toBe(true);
  });

  test('activates on transition from paused to playing', () => {
    const { result, rerender } = renderHook(
      ({ paused }) => useAds({ ...baseParams, ads: { skipAfter: 5 }, paused }),
      { initialProps: { paused: true } },
    );
    expect(result.current.isAdActive).toBe(false);
    rerender({ paused: false });
    expect(result.current.isAdActive).toBe(true);
  });

  test('canSkip becomes true when currentTime >= skipAfter', () => {
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: { skipAfter: 5 }, paused: false, currentTime: 6 }),
    );
    expect(result.current.canSkip).toBe(true);
    expect(result.current.skipCountdown).toBe(0);
  });

  test('skipCountdown computes remaining seconds', () => {
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: { skipAfter: 10 }, paused: false, currentTime: 3 }),
    );
    expect(result.current.skipCountdown).toBe(7);
  });

  test('adProgress with skipTimer', () => {
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: { skipAfter: 10 }, paused: false, currentTime: 5, duration: 100 }),
    );
    expect(result.current.adProgress).toBe(0.5);
  });

  test('adProgress caps at 1', () => {
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: { skipAfter: 5 }, paused: false, currentTime: 10, duration: 100 }),
    );
    expect(result.current.adProgress).toBe(1);
  });

  test('adProgress without skipTimer uses duration', () => {
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: {}, paused: false, currentTime: 50, duration: 100 }),
    );
    expect(result.current.adProgress).toBe(0.5);
  });

  test('adProgress returns 0 when duration is 0 and no skipTimer', () => {
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: {}, paused: false, currentTime: 5, duration: 0 }),
    );
    expect(result.current.adProgress).toBe(0);
  });

  test('onAdComplete called when ad ends', () => {
    const onAdComplete = jest.fn();
    const { rerender } = renderHook(
      ({ ended }) =>
        useAds({ ...baseParams, ads: { skipAfter: 5, onAdComplete }, paused: false, ended }),
      { initialProps: { ended: false } },
    );
    rerender({ ended: true });
    expect(onAdComplete).toHaveBeenCalledTimes(1);
  });

  test('onAdComplete not called twice', () => {
    const onAdComplete = jest.fn();
    const { rerender } = renderHook(
      ({ ended }) =>
        useAds({ ...baseParams, ads: { skipAfter: 5, onAdComplete }, paused: false, ended }),
      { initialProps: { ended: false } },
    );
    rerender({ ended: true });
    rerender({ ended: true }); // re-render same state
    expect(onAdComplete).toHaveBeenCalledTimes(1);
  });

  test('onSkipClick calls ads.onSkip when active', () => {
    const onSkip = jest.fn();
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: { skipAfter: 5, onSkip }, paused: false, currentTime: 6 }),
    );
    act(() => { result.current.onSkipClick(); });
    expect(onSkip).toHaveBeenCalled();
  });

  test('onSkipClick does nothing without onSkip', () => {
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: { skipAfter: 5 }, paused: false, currentTime: 6 }),
    );
    // Should not throw
    act(() => { result.current.onSkipClick(); });
  });

  test('onAdClick pauses, calls onAdClick, opens URL', () => {
    const onAdClick = jest.fn();
    const onPauseClick = jest.fn();
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);

    const { result } = renderHook(() =>
      useAds({
        ...baseParams,
        ads: { skipAfter: 5, url: 'http://ad.com', onAdClick },
        paused: false,
        onPauseClick,
      }),
    );

    act(() => { result.current.onAdClick(); });
    expect(onPauseClick).toHaveBeenCalled();
    expect(onAdClick).toHaveBeenCalled();
    expect(open).toHaveBeenCalledWith('http://ad.com', '_blank', 'noopener,noreferrer');
    open.mockRestore();
  });

  test('onAdClick does nothing when inactive', () => {
    const onPauseClick = jest.fn();
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: null, onPauseClick }),
    );
    act(() => { result.current.onAdClick(); });
    expect(onPauseClick).not.toHaveBeenCalled();
  });

  test('onAdClick without url and callbacks still works', () => {
    const onPauseClick = jest.fn();
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: { skipAfter: 5 }, paused: false, onPauseClick }),
    );
    act(() => { result.current.onAdClick(); });
    expect(onPauseClick).toHaveBeenCalled();
  });

  test('resets adStarted when ads prop removed', () => {
    const { result, rerender } = renderHook(
      ({ ads }) => useAds({ ...baseParams, ads, paused: false }),
      { initialProps: { ads: { skipAfter: 5 } } },
    );
    expect(result.current.isAdActive).toBe(true);
    rerender({ ads: null });
    expect(result.current.isAdActive).toBe(false);
  });

  test('ads prop appearing while playing activates immediately', () => {
    const { result, rerender } = renderHook(
      ({ ads }) => useAds({ ...baseParams, ads, paused: false }),
      { initialProps: { ads: null } },
    );
    expect(result.current.isAdActive).toBe(false);
    rerender({ ads: { skipAfter: 5 } });
    expect(result.current.isAdActive).toBe(true);
  });

  test('media session handlers blocked during active ad', () => {
    const setActionHandler = jest.fn();
    Object.defineProperty(navigator, 'mediaSession', {
      value: { setActionHandler },
      writable: true,
      configurable: true,
    });

    const { unmount } = renderHook(() =>
      useAds({ ...baseParams, ads: { skipAfter: 5 }, paused: false }),
    );
    // Should have called setActionHandler with block functions
    expect(setActionHandler).toHaveBeenCalled();
    const calls = setActionHandler.mock.calls.map((c) => c[0]);
    expect(calls).toContain('seekbackward');
    expect(calls).toContain('seekforward');
    expect(calls).toContain('seekto');
    expect(calls).toContain('previoustrack');
    expect(calls).toContain('nexttrack');

    // Cleanup should set handlers to null
    unmount();
    const nullCalls = setActionHandler.mock.calls.filter((c) => c[1] === null);
    expect(nullCalls.length).toBe(5);
  });

  test('hasSkipTimer is false when skipAfter is 0', () => {
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: { skipAfter: 0 }, paused: false }),
    );
    expect(result.current.hasSkipTimer).toBe(false);
  });

  test('hasSkipTimer is false when skipAfter is not a number', () => {
    const { result } = renderHook(() =>
      useAds({ ...baseParams, ads: { skipAfter: 'abc' }, paused: false }),
    );
    expect(result.current.hasSkipTimer).toBe(false);
  });

  test('onAdComplete not called without callback', () => {
    // Should not throw
    const { rerender } = renderHook(
      ({ ended }) => useAds({ ...baseParams, ads: { skipAfter: 5 }, paused: false, ended }),
      { initialProps: { ended: false } },
    );
    rerender({ ended: true });
    // No crash
  });
});
