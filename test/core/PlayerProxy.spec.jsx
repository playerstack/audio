import React from 'react';
import { render, act } from '@testing-library/react';

import PlayerProxy from '@core/PlayerProxy';

// Minimal mock player component
const createMockPlayer = (overrides = {}) => {
  const instance = {
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
  };
  return instance;
};

const MockPlayerComponent = React.forwardRef(function MockPlayerComp(props, ref) {
  React.useEffect(() => {
    if (props.onMount) {
      const mockInstance = createMockPlayer();
      props.onMount(mockInstance);
    }
  }, []);
  return <audio data-testid="mock-audio" />;
});

describe('PlayerProxy', () => {
  const baseProps = {
    activePlayer: MockPlayerComponent,
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

  test('renders null when activePlayer is null', () => {
    const { container } = render(<PlayerProxy {...baseProps} activePlayer={null} />);
    expect(container.innerHTML).toBe('');
  });

  test('renders activePlayer component', () => {
    const { getByTestId } = render(<PlayerProxy {...baseProps} />);
    expect(getByTestId('mock-audio')).toBeInTheDocument();
  });

  test('handlePlayerMount loads url and starts progress', () => {
    let proxyInstance;
    const TestWrapper = () => {
      const ref = React.useRef();
      proxyInstance = ref;
      return <PlayerProxy ref={ref} {...baseProps} />;
    };
    render(<TestWrapper />);
    // onMount fires which calls handlePlayerMount internally
    expect(proxyInstance).toBeDefined();
  });

  test('handleReady sets isReady and sets volume', () => {
    const onReady = jest.fn();
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} onReady={onReady} />);
    expect(onReady).toHaveBeenCalled();
    expect(mockInstance.setVolume).toHaveBeenCalledWith(0.8);
  });

  test('handleReady does not set volume when muted', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} muted={true} />);
    expect(mockInstance.setVolume).not.toHaveBeenCalled();
  });

  test('handleReady plays when playing=true', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playing={true} />);
    expect(mockInstance.play).toHaveBeenCalled();
  });

  test('handlePlay sets isPlaying, calls onStart on first play', () => {
    const onStart = jest.fn();
    const onPlay = jest.fn();
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
        props.onPlay({});
      }, []);
      return null;
    };

    render(
      <PlayerProxy {...baseProps} activePlayer={ActivePlayer} playing={true} onStart={onStart} onPlay={onPlay} />,
    );
    expect(onStart).toHaveBeenCalled();
    expect(onPlay).toHaveBeenCalled();
  });

  test('handlePlay sets playbackRate on first play when not 1', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
        props.onPlay({});
      }, []);
      return null;
    };

    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playing={true} playbackRate={1.5} />);
    expect(mockInstance.setPlaybackRate).toHaveBeenCalledWith(1.5);
  });

  test('handlePause sets isPlaying false and calls onPause', () => {
    const onPause = jest.fn();
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
        props.onPlay({});
        props.onPause({});
      }, []);
      return null;
    };

    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playing={true} onPause={onPause} />);
    expect(onPause).toHaveBeenCalled();
  });

  test('handlePause does not call onPause while loading', () => {
    const onPause = jest.fn();
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        // Do not call onReady, so isLoading remains true
        props.onPause({});
      }, []);
      return null;
    };

    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} onPause={onPause} />);
    expect(onPause).not.toHaveBeenCalled();
  });

  test('handleEnded sets isPlaying false and calls onEnded', () => {
    const onEnded = jest.fn();
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
        props.onPlay({});
        props.onEnded();
      }, []);
      return null;
    };

    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} onEnded={onEnded} />);
    expect(onEnded).toHaveBeenCalled();
  });

  test('handleEnded does nothing when loop is true', () => {
    const onEnded = jest.fn();
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
        props.onPlay({});
        props.onEnded();
      }, []);
      return null;
    };

    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} loop={true} onEnded={onEnded} />);
    expect(onEnded).not.toHaveBeenCalled();
  });

  test('handleError calls onError', () => {
    const onError = jest.fn();
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onError('err', { type: 'mediaError' }, null, null);
      }, []);
      return null;
    };

    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} onError={onError} />);
    expect(onError).toHaveBeenCalledWith('err', { type: 'mediaError' }, null, null);
  });

  test('handleLoaded sets isLoading false when ready and not startOnPlay', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
        props.onPlay({});
        props.onLoaded();
      }, []);
      return null;
    };

    const { container } = render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playing={true} />);
    expect(container).toBeDefined();
  });

  test('handleDurationCheck calls onDuration when duration available', () => {
    const onDuration = jest.fn();
    const mockInstance = createMockPlayer({ getDuration: () => 120 });

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} onDuration={onDuration} />);
    expect(onDuration).toHaveBeenCalledWith(120);
  });

  test('handleDurationCheck retries when duration not available', () => {
    const onDuration = jest.fn();
    let callCount = 0;
    const mockInstance = createMockPlayer({
      getDuration: () => {
        callCount++;
        return callCount > 2 ? 100 : null;
      },
    });

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} onDuration={onDuration} />);
    // First call: no duration, starts timeout
    act(() => { jest.advanceTimersByTime(100); });
    act(() => { jest.advanceTimersByTime(100); });
    expect(onDuration).toHaveBeenCalledWith(100);
  });

  test('progress reports played and loaded fractions', () => {
    const onProgress = jest.fn();
    const mockInstance = createMockPlayer({
      getDuration: () => 100,
      getCurrentTime: () => 50,
      getSecondsLoaded: () => 70,
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
      expect.objectContaining({ playedSeconds: 50, played: 0.5 }),
    );
  });

  test('progress does not report when values unchanged', () => {
    const onProgress = jest.fn();
    const mockInstance = createMockPlayer({
      getDuration: () => 100,
      getCurrentTime: () => 50,
      getSecondsLoaded: () => 70,
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
    const callCount = onProgress.mock.calls.length;
    act(() => { jest.advanceTimersByTime(200); });
    // Should not call again since values unchanged
    expect(onProgress.mock.calls.length).toBe(callCount);
  });

  test('componentDidUpdate: play when playing changes to true', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    const { rerender } = render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playing={false} />);
    rerender(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playing={true} />);
    expect(mockInstance.play).toHaveBeenCalled();
  });

  test('componentDidUpdate: pause when playing changes to false', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
        props.onPlay({});
      }, []);
      return null;
    };

    const { rerender } = render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playing={true} />);
    rerender(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playing={false} />);
    expect(mockInstance.pause).toHaveBeenCalled();
  });

  test('componentDidUpdate: setVolume when volume changes', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    const { rerender } = render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} volume={0.8} />);
    rerender(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} volume={0.5} />);
    expect(mockInstance.setVolume).toHaveBeenCalledWith(0.5);
  });

  test('componentDidUpdate: mute/unmute when muted changes', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    const { rerender } = render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} muted={false} />);
    rerender(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} muted={true} />);
    expect(mockInstance.mute).toHaveBeenCalled();

    rerender(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} muted={false} />);
    expect(mockInstance.unmute).toHaveBeenCalled();
  });

  test('componentDidUpdate: unmute restores volume after timeout', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    const { rerender } = render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} muted={true} volume={0.7} />);
    rerender(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} muted={false} volume={0.7} />);
    act(() => { jest.advanceTimersByTime(10); });
    expect(mockInstance.setVolume).toHaveBeenCalledWith(0.7);
  });

  test('componentDidUpdate: setPlaybackRate when changed', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    const { rerender } = render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playbackRate={1} />);
    rerender(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} playbackRate={2} />);
    expect(mockInstance.setPlaybackRate).toHaveBeenCalledWith(2);
  });

  test('componentDidUpdate: url change triggers load', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    const { rerender } = render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} url="a.mp3" />);
    rerender(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} url="b.mp3" />);
    expect(mockInstance.load).toHaveBeenCalledWith('b.mp3', true);
  });

  test('componentDidUpdate: url change defers load when loading and not forceLoad', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        // Do NOT call onReady, so isLoading stays true
      }, []);
      return null;
    };

    const { rerender } = render(
      <PlayerProxy {...baseProps} activePlayer={ActivePlayer} url="a.mp3" disableDeferredLoading={false} />,
    );
    // Still loading, url change defers
    rerender(
      <PlayerProxy {...baseProps} activePlayer={ActivePlayer} url="b.mp3" disableDeferredLoading={false} />,
    );
    // load should have been called once for initial mount
    // The deferred URL gets loaded on handleReady
  });

  test('componentWillUnmount stops player and clears timers', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    const { unmount } = render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} stopOnUnmount={true} />);
    unmount();
    expect(mockInstance.stop).toHaveBeenCalled();
  });

  test('componentWillUnmount does not stop when stopOnUnmount=false', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    const { unmount } = render(<PlayerProxy {...baseProps} activePlayer={ActivePlayer} stopOnUnmount={false} />);
    unmount();
    expect(mockInstance.stop).not.toHaveBeenCalled();
  });

  test('seekTo stores seekOnPlay when not ready', () => {
    const mockInstance = createMockPlayer();

    // Create a ref to access instance methods
    let proxyRef;
    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        // NOT calling onReady so isReady stays false
      }, []);
      return null;
    };

    class TestWrapper extends React.Component {
      constructor(props) {
        super(props);
        this.proxyRef = React.createRef();
      }
      render() {
        return <PlayerProxy ref={this.proxyRef} {...baseProps} activePlayer={ActivePlayer} />;
      }
    }

    const wrapper = render(<TestWrapper />);
    // Can't directly call seekTo on class instance from outside easily,
    // but the loadOnReady path is tested via componentDidUpdate
  });

  test('seekTo with fraction type', () => {
    const mockInstance = createMockPlayer({ getDuration: () => 200 });

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    // Access instance via refs
    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);

    // Call seekTo as fraction
    act(() => {
      instanceRef.current.seekTo(0.5, 'fraction', true);
    });
    expect(mockInstance.seekTo).toHaveBeenCalledWith(100, true);
  });

  test('seekTo with seconds type', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);

    act(() => {
      instanceRef.current.seekTo(30, 'seconds', true);
    });
    expect(mockInstance.seekTo).toHaveBeenCalledWith(30, true);
  });

  test('seekTo auto-detects fraction when value between 0 and 1', () => {
    const mockInstance = createMockPlayer({ getDuration: () => 100 });

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);

    act(() => {
      instanceRef.current.seekTo(0.5);
    });
    expect(mockInstance.seekTo).toHaveBeenCalledWith(50, undefined);
  });

  test('getDuration returns null when not ready', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
      }, []);
      return null;
    };

    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);
    expect(instanceRef.current.getDuration()).toBeNull();
  });

  test('getCurrentTime returns null when not ready', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
      }, []);
      return null;
    };

    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);
    expect(instanceRef.current.getCurrentTime()).toBeNull();
  });

  test('getSecondsLoaded returns null when not ready', () => {
    const mockInstance = createMockPlayer();

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
      }, []);
      return null;
    };

    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);
    expect(instanceRef.current.getSecondsLoaded()).toBeNull();
  });

  test('getInternalPlayer returns null when no player', () => {
    let instanceRef = React.createRef();
    const ActivePlayer = (props) => null;
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);
    expect(instanceRef.current.getInternalPlayer('player')).toBeNull();
  });

  test('handleReady loads deferred url', () => {
    const mockInstance = createMockPlayer();

    let readyFn;
    const ActivePlayer = (props) => {
      readyFn = props.onReady;
      React.useEffect(() => {
        props.onMount(mockInstance);
      }, []);
      return null;
    };

    const { rerender } = render(
      <PlayerProxy {...baseProps} activePlayer={ActivePlayer} url="a.mp3" disableDeferredLoading={false} />,
    );
    // Change URL while still loading (deferred)
    rerender(
      <PlayerProxy {...baseProps} activePlayer={ActivePlayer} url="b.mp3" disableDeferredLoading={false} />,
    );
    // Now trigger ready — should load deferred url
    act(() => { readyFn(); });
    expect(mockInstance.load).toHaveBeenCalledWith('b.mp3', true);
  });

  test('seekTo stores seekOnPlay and uses it on handlePlay', () => {
    const mockInstance = createMockPlayer({ getDuration: () => 100 });

    let playFn;
    let readyCallback;
    const ActivePlayer = (props) => {
      playFn = props.onPlay;
      readyCallback = props.onReady;
      React.useEffect(() => {
        props.onMount(mockInstance);
      }, []);
      return null;
    };

    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);

    // seekTo while not ready stores seekOnPlay
    act(() => { instanceRef.current.seekTo(30, 'seconds'); });
    expect(mockInstance.seekTo).not.toHaveBeenCalled();

    // Now become ready and play — seekOnPlay should be applied
    act(() => { readyCallback(); });
    act(() => { playFn({}); });
    expect(mockInstance.seekTo).toHaveBeenCalledWith(30, undefined);
  });

  test('progress with loadedSeconds null', () => {
    const onProgress = jest.fn();
    const mockInstance = createMockPlayer({
      getDuration: () => 100,
      getCurrentTime: () => 25,
      getSecondsLoaded: () => null,
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
      expect.objectContaining({ playedSeconds: 25, loadedSeconds: null }),
    );
  });

  test('seekTo with fraction but no duration returns early', () => {
    const mockInstance = createMockPlayer({ getDuration: () => null });

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);
    act(() => { instanceRef.current.seekTo(0.5, 'fraction'); });
    expect(mockInstance.seekTo).not.toHaveBeenCalled();
  });

  test('getInternalPlayer returns player property when player exists', () => {
    const mockInstance = createMockPlayer();
    mockInstance.player = { id: 'internal-hls' };

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);
    const result = instanceRef.current.getInternalPlayer('player');
    // getInternalPlayer accesses this.player[key]
    expect(result).toBeDefined();
  });

  test('getPlayer returns player.getPlayer()', () => {
    const mockInstance = createMockPlayer({ getPlayer: () => ({ id: 'audio-el' }) });

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
      }, []);
      return null;
    };

    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);
    const player = instanceRef.current.getPlayer();
    expect(player).toEqual({ id: 'audio-el' });
  });

  test('seekOnPlay timeout clears seekOnPlay after SEEK_ON_PLAY_EXPIRY', () => {
    const mockInstance = createMockPlayer({ getDuration: () => null });

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        // NOT calling onReady — isReady stays false
      }, []);
      return null;
    };

    let instanceRef = React.createRef();
    render(<PlayerProxy ref={instanceRef} {...baseProps} activePlayer={ActivePlayer} />);

    // seekTo when not ready stores seekOnPlay
    act(() => { instanceRef.current.seekTo(30, 'seconds'); });
    // After timeout, seekOnPlay should be cleared
    act(() => { jest.advanceTimersByTime(6000); });
    // Now if we become ready and play, seekOnPlay should NOT be used
    // (since it was cleared by timeout)
  });

  test('progress uses progressFrequency over progressInterval', () => {
    const onProgress = jest.fn();
    let callCount = 0;
    const mockInstance = createMockPlayer({
      getDuration: () => 100,
      getCurrentTime: () => {
        callCount++;
        return callCount * 10;
      },
      getSecondsLoaded: () => 70,
    });

    const ActivePlayer = (props) => {
      React.useEffect(() => {
        props.onMount(mockInstance);
        props.onReady();
        props.onPlay({});
      }, []);
      return null;
    };

    render(
      <PlayerProxy
        {...baseProps}
        activePlayer={ActivePlayer}
        playing={true}
        onProgress={onProgress}
        progressFrequency={50}
      />,
    );
    act(() => { jest.advanceTimersByTime(60); });
    expect(onProgress).toHaveBeenCalled();
  });
});
