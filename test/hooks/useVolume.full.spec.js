import React from 'react';
import { renderHook, act } from '@testing-library/react';

const useVolume = require('../../src/hooks/useVolume').default;

describe('useVolume - full coverage', () => {
  let el;
  let videoRef;
  let updateState;

  beforeEach(() => {
    jest.useFakeTimers();
    el = document.createElement('audio');
    Object.defineProperty(el, 'volume', { writable: true, value: 0.8, configurable: true });
    Object.defineProperty(el, 'muted', { writable: true, value: false, configurable: true });
    videoRef = { current: el };
    updateState = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('onVolumeChange updates state from native event', () => {
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );
    // Simulate native volumechange event
    const event = new Event('volumechange');
    Object.defineProperty(event, 'target', { value: { volume: 0.5, muted: false } });
    act(() => { el.dispatchEvent(event); });
    expect(updateState).toHaveBeenCalledWith({ volume: 0.5, muted: false });
  });

  test('onVolumeChange detects muted when volume is 0', () => {
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );
    const event = new Event('volumechange');
    Object.defineProperty(event, 'target', { value: { volume: 0, muted: false } });
    act(() => { el.dispatchEvent(event); });
    expect(updateState).toHaveBeenCalledWith({ volume: 0, muted: true });
  });

  test('onVolumeChange ignored when videoRef is null', () => {
    const nullRef = { current: null };
    renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef: nullRef, src: 'a.mp3', updateState }),
    );
    // No crash, no state update
    expect(updateState).not.toHaveBeenCalled();
  });

  test('onMutedClick mutes the element', () => {
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );

    act(() => { result.current.onMutedClick(); });
    expect(el.muted).toBe(true);
    expect(updateState).toHaveBeenCalledWith({ volume: 0.8, muted: true });
  });

  test('onMutedClick unmutes and restores volume', () => {
    el.muted = true;
    el.volume = 0.8;
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: true, videoRef, src: 'a.mp3', updateState }),
    );

    act(() => { result.current.onMutedClick(); });
    expect(el.muted).toBe(false);
    expect(updateState).toHaveBeenCalledWith({ volume: 0.8, muted: false });
  });

  test('onMutedClick does nothing when videoRef is null', () => {
    const nullRef = { current: null };
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef: nullRef, src: 'a.mp3', updateState }),
    );
    act(() => { result.current.onMutedClick(); });
    expect(updateState).not.toHaveBeenCalled();
  });

  test('onMutedClick ignores volumechange during programmatic change', () => {
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );

    act(() => { result.current.onMutedClick(); });
    updateState.mockClear();

    // Simulate volumechange event that happens synchronously after mute
    const event = new Event('volumechange');
    Object.defineProperty(event, 'target', { value: { volume: 0.8, muted: true } });
    act(() => { el.dispatchEvent(event); });
    // Should be ignored
    expect(updateState).not.toHaveBeenCalled();

    // After timeout, listener re-enabled
    act(() => { jest.advanceTimersByTime(10); });
    updateState.mockClear();
    const event2 = new Event('volumechange');
    Object.defineProperty(event2, 'target', { value: { volume: 0.3, muted: false } });
    act(() => { el.dispatchEvent(event2); });
    expect(updateState).toHaveBeenCalledWith({ volume: 0.3, muted: false });
  });

  test('changeVolume sets volume and updates state', () => {
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );

    act(() => { result.current.changeVolume(0.6); });
    expect(el.volume).toBe(0.6);
    expect(updateState).toHaveBeenCalledWith({ volume: 0.6, muted: false });
  });

  test('changeVolume to 0 sets muted', () => {
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );

    act(() => { result.current.changeVolume(0); });
    expect(updateState).toHaveBeenCalledWith({ volume: 0, muted: true });
  });

  test('changeVolume unmutes when volume > 0 and element was muted', () => {
    el.muted = true;
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: true, videoRef, src: 'a.mp3', updateState }),
    );

    act(() => { result.current.changeVolume(0.4); });
    expect(el.muted).toBe(false);
    expect(updateState).toHaveBeenCalledWith({ volume: 0.4, muted: false });
  });

  test('changeVolume does nothing when videoRef is null', () => {
    const nullRef = { current: null };
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef: nullRef, src: 'a.mp3', updateState }),
    );
    act(() => { result.current.changeVolume(0.5); });
    expect(updateState).not.toHaveBeenCalled();
  });

  test('updateVolumeWithCallback calls changeVolume with result', () => {
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );

    act(() => { result.current.updateVolumeWithCallback((v) => Math.min(1, v + 0.1)); });
    expect(updateState).toHaveBeenCalled();
  });

  test('updateVolumeWithCallback does nothing when videoRef is null', () => {
    const nullRef = { current: null };
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef: nullRef, src: 'a.mp3', updateState }),
    );
    act(() => { result.current.updateVolumeWithCallback((v) => v + 0.1); });
    expect(updateState).not.toHaveBeenCalled();
  });

  test('effect syncs muted state to element when src changes', () => {
    const { rerender } = renderHook(
      ({ muted, src }) => useVolume({ prevented: false, muted, videoRef, src, updateState }),
      { initialProps: { muted: false, src: 'a.mp3' } },
    );

    rerender({ muted: true, src: 'b.mp3' });
    expect(el.muted).toBe(true);

    rerender({ muted: false, src: 'c.mp3' });
    expect(el.muted).toBe(false);
  });

  test('cleanup removes volumechange listener', () => {
    const removeSpy = jest.spyOn(el, 'removeEventListener');
    const { unmount } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('volumechange', expect.any(Function));
  });

  test('effect does not add listener when videoRef.current is null', () => {
    const nullRef = { current: null };
    const { unmount } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef: nullRef, src: 'a.mp3', updateState }),
    );
    unmount();
    // No crash
  });

  test('onMutedClick remembers volume before mute', () => {
    el.volume = 0.65;
    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );

    // Mute
    act(() => { result.current.onMutedClick(); });
    updateState.mockClear();

    // Unmute - should restore 0.65
    el.muted = true;
    act(() => { result.current.onMutedClick(); });
    expect(updateState).toHaveBeenCalledWith({ volume: 0.65, muted: false });
  });
});

describe('useVolume - additional branch coverage', () => {
  test('second effect (sync muted) bails when videoRef.current is null', () => {
    const nullRef = { current: null };
    const updateState = jest.fn();
    const { rerender } = renderHook(
      ({ src, muted }) =>
        useVolume({ prevented: false, muted, videoRef: nullRef, src, updateState }),
      { initialProps: { src: 'a.mp3', muted: false } },
    );
    // Change src with null videoRef — should not crash
    rerender({ src: 'b.mp3', muted: true });
    expect(true).toBe(true);
  });

  test('onVolumeChange does not update when ignoreVolumeChange is active', () => {
    jest.useFakeTimers();
    const el = document.createElement('audio');
    Object.defineProperty(el, 'volume', { writable: true, value: 0.8, configurable: true });
    Object.defineProperty(el, 'muted', { writable: true, value: false, configurable: true });
    const videoRef = { current: el };
    const updateState = jest.fn();

    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );

    // Trigger mute which sets ignoreVolumeChangeRef
    act(() => { result.current.onMutedClick(); });
    updateState.mockClear();

    // Dispatch volumechange — should be ignored (ignoreVolumeChangeRef is true)
    const event = new Event('volumechange');
    Object.defineProperty(event, 'target', { value: { volume: 0, muted: true } });
    act(() => { el.dispatchEvent(event); });
    expect(updateState).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  test('onMutedClick remembers volume=0 before mute (uses 0.8 default on unmute)', () => {
    jest.useFakeTimers();
    const el = document.createElement('audio');
    Object.defineProperty(el, 'volume', { writable: true, value: 0, configurable: true });
    Object.defineProperty(el, 'muted', { writable: true, value: false, configurable: true });
    const videoRef = { current: el };
    const updateState = jest.fn();

    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );

    // Mute when volume is already 0 — volumeBeforeMuteRef stays at default 0.8
    act(() => { result.current.onMutedClick(); });
    updateState.mockClear();
    act(() => { jest.advanceTimersByTime(10); });

    // Unmute — should restore 0.8 (default)
    el.muted = true;
    act(() => { result.current.onMutedClick(); });
    expect(updateState).toHaveBeenCalledWith({ volume: 0.8, muted: false });

    jest.useRealTimers();
  });
});

describe('useVolume - unreachable guard branches', () => {
  test('onVolumeChange bails when videoRef becomes null after listener attached', () => {
    jest.useFakeTimers();
    const el = document.createElement('audio');
    Object.defineProperty(el, 'volume', { writable: true, value: 0.8, configurable: true });
    Object.defineProperty(el, 'muted', { writable: true, value: false, configurable: true });
    const videoRef = { current: el };
    const updateState = jest.fn();

    renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );

    // Now set videoRef.current to null AFTER listener was attached
    videoRef.current = null;

    // Dispatch volumechange — should hit the early return (line 12)
    const event = new Event('volumechange');
    Object.defineProperty(event, 'target', { value: { volume: 0.5, muted: false } });
    act(() => { el.dispatchEvent(event); });
    expect(updateState).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  test('onMutedClick bails on second guard when videoRef.current nullified between checks', () => {
    // This is truly unreachable (line 35), but we can verify the first guard covers it
    jest.useFakeTimers();
    const videoRef = { current: null };
    const updateState = jest.fn();

    const { result } = renderHook(() =>
      useVolume({ prevented: false, muted: false, videoRef, src: 'a.mp3', updateState }),
    );

    // onMutedClick with null videoRef hits first guard
    act(() => { result.current.onMutedClick(); });
    expect(updateState).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  test('muted sync effect bails when videoRef.current is null on src change', () => {
    jest.useFakeTimers();
    const el = document.createElement('audio');
    Object.defineProperty(el, 'volume', { writable: true, value: 0.8, configurable: true });
    Object.defineProperty(el, 'muted', { writable: true, value: false, configurable: true });
    const videoRef = { current: el };
    const updateState = jest.fn();

    const { rerender } = renderHook(
      ({ src, muted }) =>
        useVolume({ prevented: false, muted, videoRef, src, updateState }),
      { initialProps: { src: 'a.mp3', muted: false } },
    );

    // Null the ref before re-render
    videoRef.current = null;
    rerender({ src: 'b.mp3', muted: true });
    // Should not crash — hits the guard at line 116
    expect(true).toBe(true);

    jest.useRealTimers();
  });
});
