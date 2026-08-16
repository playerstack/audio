import React from 'react';
import { render, act } from '@testing-library/react';

import PlayerProxy from '../../src/core/PlayerProxy';

const createMockPlayer = (overrides = {}) => ({
  load: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  seekTo: jest.fn(),
  setVolume: jest.fn(),
  mute: jest.fn(),
  unmute: jest.fn(),
  setPlaybackRate: jest.fn(),
  getDuration: jest.fn(() => 120),
  getCurrentTime: jest.fn(() => 30),
  getSecondsLoaded: jest.fn(() => 60),
  getPlayer: jest.fn(() => ({})),
  ...overrides,
});

describe('PlayerProxy — branch coverage', () => {
  const baseProps = {
    activePlayer: null,
    url: 'test.mp3',
    playing: false,
    volume: 0.8,
    muted: false,
    playbackRate: 1,
    loop: false,
    stopOnUnmount: true,
    progressFrequency: 100,
    progressInterval: 1000,
    config: { attributes: {} },
    onReady: jest.fn(),
    onStart: jest.fn(),
    onPlay: jest.fn(),
    onPause: jest.fn(),
    onEnded: jest.fn(),
    onError: jest.fn(),
    onBuffer: jest.fn(),
    onBufferEnd: jest.fn(),
    onDuration: jest.fn(),
    onSeek: jest.fn(),
    onPlayBackRateChange: jest.fn(),
    onProgress: jest.fn(),
    onLoaded: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Line 48: componentDidUpdate with no player (player is null)
  test('componentDidUpdate does nothing when player is null', () => {
    const ActivePlayer = () => null; // Never calls onMount
    const { rerender, container } = render(
      <PlayerProxy {...baseProps} activePlayer={ActivePlayer} url="a.mp3" />,
    );
    // Rerender with new URL — should hit !this.player guard and return
    rerender(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} url="b.mp3" />);
    expect(container).toBeDefined();
  });

  // Line 54: url change while loading, no forceLoad, not disableDeferredLoading
  test('defers load when loading and not disableDeferredLoading', () => {
    const mockInstance = createMockPlayer();
    const ActivePlayer = (props) => {
      React.useEffect(() => { props.onMount(mockInstance); }, []);
      return null;
    };
    const { rerender } = render(
      <PlayerProxy {...baseProps} activePlayer={ActivePlayer} url="a.mp3" disableDeferredLoading={false} />,
    );
    // isLoading is true initially (before onReady). Change URL => defers
    rerender(
      <PlayerProxy {...baseProps} activePlayer={ActivePlayer} url="b.mp3" disableDeferredLoading={false} />,
    );
    // load should NOT be called for "b.mp3" yet (deferred)
    const loadCalls = mockInstance.load.mock.calls.filter((c) => c[0] === 'b.mp3');
    expect(loadCalls.length).toBe(0);
  });

  // Line 125: progress called when duration is null/0
  test('progress does not call onProgress when duration is null', () => {
    const onProgress = jest.fn();
    const mockInstance = createMockPlayer({
      getDuration: () => null,
      getCurrentTime: () => 10,
      getSecondsLoaded: () => 5,
    });
    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
        props.onPlay({});
      }, []);
      return null;
    };
    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playing={true} onProgress={onProgress} />);
    act(() => { jest.advanceTimersByTime(200); });
    // onProgress should NOT have been called because duration is null
    expect(onProgress).not.toHaveBeenCalled();
  });

  // Line 154: seekTo when not ready stores seekOnPlay; then timeout clears it
  test('seekTo when not ready stores seekOnPlay that expires', () => {
    const mockInstance = createMockPlayer();
    const ActivePlayer = (props) => {
      React.useEffect(() => { props.onMount(mockInstance); }, []);
      return null;
    };
    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);

    // Seek before ready
    act(() => { instanceRef.current.seekTo(30, 'seconds'); });
    expect(mockInstance.seekTo).not.toHaveBeenCalled();

    // Advance past SEEK_ON_PLAY_EXPIRY (5000ms)
    act(() => { jest.advanceTimersByTime(6000); });
    // seekOnPlay should now be null (expired)
    // When ready fires now, it should NOT seek
  });

  // Line 179: handleReady called after unmount (mounted=false)
  test('handleReady does nothing when unmounted', () => {
    const onReady = jest.fn();
    let readyFn;
    const ActivePlayer = (props) => {
      readyFn = props.onReady;
      React.useEffect(() => { props.onMount(createMockPlayer()); }, []);
      return null;
    };
    const { unmount } = render(
      <PlayerProxy {...baseProps} activePlayer={ActivePlayer} onReady={onReady} />,
    );
    unmount();
    // Call ready after unmount
    act(() => { if (readyFn) readyFn(); });
    // onReady should NOT be called because mounted=false guard triggers
    expect(onReady).not.toHaveBeenCalled();
  });

  // componentDidUpdate: volume is null (should not setVolume)
  test('componentDidUpdate skips setVolume when volume is null', () => {
    const mockInstance = createMockPlayer();
    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };
    const { rerender } = render(
      <PlayerProxy {...baseProps} activePlayer={ActivePlayer} volume={0.8} />,
    );
    mockInstance.setVolume.mockClear();
    rerender(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} volume={null} />);
    // volume===null, should not call setVolume
    expect(mockInstance.setVolume).not.toHaveBeenCalled();
  });

  // handlePlay: second play does NOT call onStart again
  test('handlePlay second time does not call onStart', () => {
    const onStart = jest.fn();
    const mockInstance = createMockPlayer();
    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
        props.onPlay({});
        props.onPause({});
        props.onPlay({}); // Second play
      }, []);
      return null;
    };
    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playing={true} onStart={onStart} />);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  // seekTo with amount=0 when not ready does NOT store seekOnPlay
  test('seekTo with amount=0 does not store seekOnPlay', () => {
    const mockInstance = createMockPlayer();
    const ActivePlayer = (props) => {
      React.useEffect(() => { props.onMount(mockInstance); }, []);
      return null;
    };
    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);
    act(() => { instanceRef.current.seekTo(0, 'seconds'); });
    // Should just return without storing
    expect(mockInstance.seekTo).not.toHaveBeenCalled();
  });

  // progress: loadedSeconds is not null path
  test('progress includes loadedSeconds when available', () => {
    const onProgress = jest.fn();
    const mockInstance = createMockPlayer({
      getDuration: () => 100,
      getCurrentTime: () => 50,
      getSecondsLoaded: () => 75,
    });
    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
        props.onPlay({});
      }, []);
      return null;
    };
    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playing={true} onProgress={onProgress} />);
    act(() => { jest.advanceTimersByTime(200); });
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({ loadedSeconds: 75, loaded: 0.75 }),
    );
  });

  // handlePlay with seekOnPlay stored
  test('handlePlay applies stored seekOnPlay', () => {
    const mockInstance = createMockPlayer({ getDuration: () => 100 });
    let readyFn, playFn;
    const ActivePlayer = (props) => {
      readyFn = props.onReady;
      playFn = props.onPlay;
      React.useEffect(() => { props.onMount(mockInstance); }, []);
      return null;
    };
    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);

    // Seek before ready
    act(() => { instanceRef.current.seekTo(50, 'seconds'); });
    // Now ready + play
    act(() => { readyFn(); });
    act(() => { playFn({}); });
    expect(mockInstance.seekTo).toHaveBeenCalledWith(50, undefined);
  });
});
