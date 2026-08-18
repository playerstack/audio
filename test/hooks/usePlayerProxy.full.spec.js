import { renderHook, act } from '@testing-library/react';

const usePlayerProxy = require('../../src/AudioMediaPlayer/hooks/usePlayerProxy').default;

describe('usePlayerProxy — full coverage', () => {
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

  test('onBuffer sets isBuffering true', () => {
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState }));
    act(() => { result.current.onBuffer(); });
    const updater = updateState.mock.calls[0][0];
    const newState = updater({ isBuffering: false });
    expect(newState.isBuffering).toBe(true);
  });

  test('onBufferEnd sets isBuffering false', () => {
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState }));
    act(() => { result.current.onBufferEnd(); });
    const updater = updateState.mock.calls[0][0];
    const newState = updater({ isBuffering: true });
    expect(newState.isBuffering).toBe(false);
  });

  test('onDuration sets duration in state', () => {
    const updateState = jest.fn();
    const onDuration = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState, onDuration }));
    act(() => { result.current.onDuration(180); });
    expect(onDuration).toHaveBeenCalledWith(180);
    const updater = updateState.mock.calls[0][0];
    const newState = updater({ duration: 0 });
    expect(newState.duration).toBe(180);
  });

  test('onEnded sets isEnded true', () => {
    const updateState = jest.fn();
    const onEnded = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState, onEnded }));
    act(() => { result.current.onEnded({}); });
    expect(onEnded).toHaveBeenCalled();
    const updater = updateState.mock.calls[0][0];
    const newState = updater({ isEnded: false });
    expect(newState.isEnded).toBe(true);
  });

  test('onError with non-recoverable error sets kernelError', () => {
    const updateState = jest.fn();
    const onError = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState, onError }));
    act(() => {
      result.current.onError('err', { type: 'fatalError', error: { message: 'Fatal' } });
    });
    expect(onError).toHaveBeenCalled();
    expect(updateState).toHaveBeenCalled();
    const updater = updateState.mock.calls[0][0];
    const newState = updater({ kernelError: null, isLoading: true, playing: true });
    expect(newState.kernelError).toEqual({ type: 'fatalError', detail: 'Fatal' });
    expect(newState.isLoading).toBe(false);
    expect(newState.playing).toBe(false);
  });

  test('onError with networkError is recoverable — no state update', () => {
    const updateState = jest.fn();
    const onError = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState, onError }));
    act(() => {
      result.current.onError('err', { type: 'networkError' });
    });
    expect(onError).toHaveBeenCalled();
    expect(updateState).not.toHaveBeenCalled();
  });

  test('onError with mediaError + recoverable detail is recoverable', () => {
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState }));
    act(() => {
      result.current.onError('err', { type: 'mediaError', details: 'bufferStalledError' });
    });
    expect(updateState).not.toHaveBeenCalled();
  });

  test('onError with mediaError + non-recoverable detail updates state', () => {
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState }));
    act(() => {
      result.current.onError('err', { type: 'mediaError', details: 'someOtherError', error: { message: 'Bad' } });
    });
    expect(updateState).toHaveBeenCalled();
  });

  test('onError with null data sets kernelError null', () => {
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState }));
    act(() => {
      result.current.onError('err', null);
    });
    expect(updateState).toHaveBeenCalled();
    const updater = updateState.mock.calls[0][0];
    const newState = updater({ kernelError: 'old' });
    expect(newState.kernelError).toBeNull();
  });

  test('onPause sets playing false', () => {
    const updateState = jest.fn();
    const onPause = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState, onPause }));
    act(() => { result.current.onPause({}); });
    expect(onPause).toHaveBeenCalled();
    const updater = updateState.mock.calls[0][0];
    const newState = updater({ playing: true });
    expect(newState.playing).toBe(false);
  });

  test('onPlay sets playing true, isEnded false, hasAudio true', () => {
    const updateState = jest.fn();
    const onPlay = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState, onPlay }));
    act(() => { result.current.onPlay({}); });
    expect(onPlay).toHaveBeenCalled();
    const updater = updateState.mock.calls[0][0];
    const newState = updater({ playing: false, isEnded: true, hasAudio: false });
    expect(newState.playing).toBe(true);
    expect(newState.isEnded).toBe(false);
    expect(newState.hasAudio).toBe(true);
  });

  test('onPlayBackRateChange sets playbackRate', () => {
    const updateState = jest.fn();
    const onPlayBackRateChange = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState, onPlayBackRateChange }));
    act(() => { result.current.onPlayBackRateChange(1.5); });
    expect(onPlayBackRateChange).toHaveBeenCalledWith(1.5);
    const updater = updateState.mock.calls[0][0];
    const newState = updater({ playbackRate: 1 });
    expect(newState.playbackRate).toBe(1.5);
  });

  test('onProgress updates played and loaded when not seeking', () => {
    const updateState = jest.fn();
    const onProgress = jest.fn();
    const { result } = renderHook(() =>
      usePlayerProxy({ ...baseParams, updateState, onProgress, playerState: { seeking: false } }),
    );
    act(() => { result.current.onProgress({ playedSeconds: 45, loaded: 0.7 }); });
    expect(onProgress).toHaveBeenCalled();
    expect(updateState).toHaveBeenCalled();
    const updater = updateState.mock.calls[0][0];
    const newState = updater({ played: 0, loaded: 0 });
    expect(newState.played).toBe(45);
    expect(newState.loaded).toBe(0.7);
  });

  test('onProgress does NOT update state when seeking', () => {
    const updateState = jest.fn();
    const onProgress = jest.fn();
    const { result } = renderHook(() =>
      usePlayerProxy({ ...baseParams, updateState, onProgress, playerState: { seeking: true } }),
    );
    act(() => { result.current.onProgress({ playedSeconds: 45, loaded: 0.7 }); });
    expect(onProgress).toHaveBeenCalled();
    expect(updateState).not.toHaveBeenCalled();
  });

  test('onReady sets isLoading false', () => {
    const updateState = jest.fn();
    const onReady = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState, onReady }));
    act(() => { result.current.onReady({}); });
    expect(onReady).toHaveBeenCalled();
    const updater = updateState.mock.calls[0][0];
    const newState = updater({ isLoading: true });
    expect(newState.isLoading).toBe(false);
  });

  test('onSeek sets seek time', () => {
    const updateState = jest.fn();
    const onSeek = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState, onSeek }));
    act(() => { result.current.onSeek(55); });
    expect(onSeek).toHaveBeenCalledWith(55);
    const updater = updateState.mock.calls[0][0];
    const newState = updater({ seek: 0 });
    expect(newState.seek).toBe(55);
  });

  test('onStart calls callback only', () => {
    const onStart = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, onStart }));
    act(() => { result.current.onStart(); });
    expect(onStart).toHaveBeenCalled();
  });

  test('onLoaded calls callback only', () => {
    const onLoaded = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, onLoaded }));
    act(() => { result.current.onLoaded(); });
    expect(onLoaded).toHaveBeenCalled();
  });

  test('onMount calls callback only', () => {
    const onMount = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, onMount }));
    act(() => { result.current.onMount(); });
    expect(onMount).toHaveBeenCalled();
  });

  test('callbacks are not called when not provided (null)', () => {
    const updateState = jest.fn();
    const { result } = renderHook(() =>
      usePlayerProxy({
        ...baseParams,
        onBuffer: null,
        onBufferEnd: null,
        onDuration: null,
        onEnded: null,
        onError: null,
        onPause: null,
        onPlay: null,
        onPlayBackRateChange: null,
        onProgress: null,
        onReady: null,
        onSeek: null,
        onStart: null,
        onLoaded: null,
        onMount: null,
        updateState,
      }),
    );
    // None should throw
    act(() => {
      result.current.onBuffer();
      result.current.onBufferEnd();
      result.current.onDuration(100);
      result.current.onEnded({});
      result.current.onError('e', { type: 'fatal', error: { message: 'x' } });
      result.current.onPause({});
      result.current.onPlay({});
      result.current.onPlayBackRateChange(2);
      result.current.onProgress({ playedSeconds: 10, loaded: 0.5 });
      result.current.onReady({});
      result.current.onSeek(10);
      result.current.onStart();
      result.current.onLoaded();
      result.current.onMount();
    });
    // Should not throw
    expect(true).toBe(true);
  });

  test('onError without error.message uses fallback message', () => {
    const updateState = jest.fn();
    const { result } = renderHook(() => usePlayerProxy({ ...baseParams, updateState }));
    act(() => {
      result.current.onError('err', { type: 'fatal' });
    });
    const updater = updateState.mock.calls[0][0];
    const newState = updater({});
    expect(newState.kernelError.detail).toBe('Something was wrong with the playback. Please try again.');
  });
});
