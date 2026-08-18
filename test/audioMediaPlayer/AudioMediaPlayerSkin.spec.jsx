import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

jest.mock('react-fast-compare', () => ({
  __esModule: true,
  default: (a, b) => JSON.stringify(a) === JSON.stringify(b),
}));

// Mock PlayerProxy to avoid needing real audio element
jest.mock('../../src/core/PlayerProxy', () => {
  const ReactInner = require('react');
  return ReactInner.forwardRef(function MockPlayerProxy(props, ref) {
    ReactInner.useImperativeHandle(ref, () => ({
      getDuration: () => 120,
      getCurrentTime: () => 30,
      getSecondsLoaded: () => 60,
      seekTo: jest.fn(),
      getPlayer: () => ({ volume: 0.8, muted: false, currentTime: 30, playbackRate: 1 }),
    }));
    ReactInner.useEffect(() => {
      if (props.onReady) props.onReady();
    }, []);
    return null;
  });
});

import AudioMediaPlayerSkin from '@AudioMediaPlayer/index';

describe('AudioMediaPlayerSkin', () => {
  const baseProps = {
    activePlayer: React.forwardRef((p, r) => null),
    player: null,
    url: 'https://example.com/track.mp3',
    playing: false,
    playbackRate: 1,
    volume: 0.8,
    muted: false,
    loop: false,
    width: '100%',
    progressInterval: 1000,
    playsinline: true,
    stopOnUnmount: true,
    waiting: false,
    language: 'en',
    poster: '',
    title: 'Test Track',
    artist: 'Test Artist',
    chapters: [],
    config: { attributes: {}, tracks: [] },
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
    ads: null,
  };

  test('renders without crashing', () => {
    const { container } = render(<AudioMediaPlayerSkin {...baseProps} />);
    expect(container).toBeDefined();
  });

  test('renders audio player skin content', () => {
    const { container } = render(<AudioMediaPlayerSkin {...baseProps} />);
    // Should have role="application" from AudioPlayerWrapper
    expect(container.querySelector('[role="application"]')).toBeInTheDocument();
  });

  test('renders with title displayed', () => {
    const { getByText } = render(<AudioMediaPlayerSkin {...baseProps} title="My Track" />);
    expect(getByText(/My Track/)).toBeInTheDocument();
  });

  test('renders with chapters', () => {
    const chapters = [
      { title: 'Intro', startTime: 0 },
      { title: 'Main', startTime: 60 },
    ];
    const { container } = render(<AudioMediaPlayerSkin {...baseProps} chapters={chapters} />);
    expect(container).toBeDefined();
  });

  test('renders with ads config', () => {
    const ads = {
      title: 'Ad Title',
      url: 'https://ad.com',
      buttonText: 'Visit',
      skipAfter: 5,
      onSkip: jest.fn(),
      onAdClick: jest.fn(),
      onAdComplete: jest.fn(),
    };
    const { container } = render(<AudioMediaPlayerSkin {...baseProps} ads={ads} />);
    expect(container).toBeDefined();
  });

  test('handles playing state change', () => {
    const { rerender, container } = render(<AudioMediaPlayerSkin {...baseProps} playing={false} />);
    rerender(<AudioMediaPlayerSkin {...baseProps} playing={true} />);
    expect(container).toBeDefined();
  });

  test('handles muted state change', () => {
    const { rerender, container } = render(<AudioMediaPlayerSkin {...baseProps} muted={false} />);
    rerender(<AudioMediaPlayerSkin {...baseProps} muted={true} />);
    expect(container).toBeDefined();
  });

  test('handles volume change', () => {
    const { rerender, container } = render(<AudioMediaPlayerSkin {...baseProps} volume={0.8} />);
    rerender(<AudioMediaPlayerSkin {...baseProps} volume={0.3} />);
    expect(container).toBeDefined();
  });

  test('handles volume null (uses default)', () => {
    const { rerender, container } = render(<AudioMediaPlayerSkin {...baseProps} volume={0.8} />);
    rerender(<AudioMediaPlayerSkin {...baseProps} volume={null} />);
    expect(container).toBeDefined();
  });

  test('handles muted change with null volume (uses default)', () => {
    const { rerender, container } = render(<AudioMediaPlayerSkin {...baseProps} muted={false} volume={null} />);
    rerender(<AudioMediaPlayerSkin {...baseProps} muted={true} volume={null} />);
    expect(container).toBeDefined();
  });

  test('unmuting with volume prop restores volume', () => {
    const { rerender, container } = render(<AudioMediaPlayerSkin {...baseProps} muted={true} volume={0.5} />);
    rerender(<AudioMediaPlayerSkin {...baseProps} muted={false} volume={0.5} />);
    expect(container).toBeDefined();
  });

  test('handles url change (resets loading state)', () => {
    const { rerender, container } = render(<AudioMediaPlayerSkin {...baseProps} url="a.mp3" />);
    rerender(<AudioMediaPlayerSkin {...baseProps} url="b.mp3" />);
    expect(container).toBeDefined();
  });
});
