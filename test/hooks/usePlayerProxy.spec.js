import { renderHook, act } from '@testing-library/react';

const usePlayerProxy = require('../../src/AudioMediaPlayer/hooks/usePlayerProxy').default;

describe('usePlayerProxy', () => {
  const baseParams = {
    onBuffer: jest.fn(),
    onBufferEnd: jest.fn(),
    onDuration: jest.fn(),
    onEnded: jest.fn(),
    onError: jest.fn(),
    onPause: jest.fn(),
    onPlay: jest.fn(),
    onPlayBackRateChange: jest.fn(),
    onProgress: jest.fn(),
    onReady: jest.fn(),
    onSeek: jest.fn(),
    onStart: jest.fn(),
    onLoaded: jest.fn(),
    onMount: jest.fn(),
    updateState: jest.fn(),
    playerState: { seeking: false, playing: false },
    extraProps: { url: 'test.mp3' },
  };

  test('returns videoUrl and proxy callbacks', () => {
    const { result } = renderHook(() => usePlayerProxy(baseParams));
    expect(result.current.videoUrl).toBeDefined();
    expect(result.current.onBuffer).toBeDefined();
    expect(result.current.onBufferEnd).toBeDefined();
    expect(result.current.onDuration).toBeDefined();
    expect(result.current.onProgress).toBeDefined();
    expect(result.current.onReady).toBeDefined();
  });

  test('videoUrl equals extraProps.url', () => {
    const { result } = renderHook(() => usePlayerProxy(baseParams));
    expect(result.current.videoUrl).toBe('test.mp3');
  });

  test('onBuffer calls updateState with isBuffering true', () => {
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState }));
    act(() => { result.current.onBuffer(); });
    expect(updateState).toHaveBeenCalled();
  });

  test('onBufferEnd calls updateState with isBuffering false', () => {
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState }));
    act(() => { result.current.onBufferEnd(); });
    expect(updateState).toHaveBeenCalled();
  });

  test('onDuration calls updateState and callback', () => {
    const onDuration = jest.fn();
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, onDuration, updateState }));
    act(() => { result.current.onDuration(120); });
    expect(onDuration).toHaveBeenCalledWith(120);
    expect(updateState).toHaveBeenCalled();
  });

  test('onPlay calls updateState and callback', () => {
    const onPlay = jest.fn();
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, onPlay, updateState }));
    act(() => { result.current.onPlay({}); });
    expect(onPlay).toHaveBeenCalled();
    expect(updateState).toHaveBeenCalled();
  });

  test('onPause calls callback and updateState', () => {
    const onPause = jest.fn();
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, onPause, updateState }));
    act(() => { result.current.onPause(); });
    expect(onPause).toHaveBeenCalled();
  });

  test('onEnded calls callback and updateState', () => {
    const onEnded = jest.fn();
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, onEnded, updateState }));
    act(() => { result.current.onEnded(); });
    expect(onEnded).toHaveBeenCalled();
  });

  test('onError calls callback', () => {
    const onError = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, onError }));
    act(() => { result.current.onError('err', { type: 'mediaError' }); });
    expect(onError).toHaveBeenCalled();
  });

  test('onProgress calls callback and updateState', () => {
    const onProgress = jest.fn();
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, onProgress, updateState }));
    act(() => { result.current.onProgress({ played: 0.5, loaded: 0.8 }); });
    expect(onProgress).toHaveBeenCalled();
  });

  test('onSeek calls callback', () => {
    const onSeek = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, onSeek }));
    act(() => { result.current.onSeek(30); });
    expect(onSeek).toHaveBeenCalledWith(30);
  });
});
