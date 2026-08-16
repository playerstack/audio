import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { AppContextProvider } from '../../src/context/AppContextProvider';
import AudioPlayerSkin from '../../src/AudioPlayer/AudioPlayerSkin';

const Wrapper = ({ children }) => <AppContextProvider language="en">{children}</AppContextProvider>;

describe('AudioPlayerSkin', () => {
  const baseProps = {
    videoRef: { current: document.createElement('audio') },
    playerRef: { current: document.createElement('div') },
    hasResource: true,
    loading: false,
    paused: true,
    ended: false,
    seeking: false,
    waiting: false,
    duration: 120,
    buffered: 0.5,
    currentTime: 30,
    muted: false,
    volume: 0.8,
    playbackRate: 1,
    loop: false,
    poster: '',
    title: 'Test Song',
    artist: 'Test Artist',
    chapters: [],
    onPlayClick: jest.fn(),
    onPauseClick: jest.fn(),
    onTogglePlay: jest.fn(),
    changeVolume: jest.fn(),
    onMutedClick: jest.fn(),
    changeCurrentTime: jest.fn(),
    changePlaybackRate: jest.fn(),
    onSeeking: jest.fn(),
    ads: null,
  };

  test('renders paused state with play button', () => {
    const { container } = render(<Wrapper><AudioPlayerSkin {...baseProps} /></Wrapper>);
    expect(container.querySelector('[aria-label="Play"]')).toBeInTheDocument();
  });

  test('renders playing state with pause button', () => {
    const { container } = render(<Wrapper><AudioPlayerSkin {...baseProps} paused={false} /></Wrapper>);
    expect(container.querySelector('[aria-label="Pause"]')).toBeInTheDocument();
  });

  test('renders ended state with replay button', () => {
    const { container } = render(<Wrapper><AudioPlayerSkin {...baseProps} ended={true} /></Wrapper>);
    expect(container.querySelector('[aria-label="Replay"]')).toBeInTheDocument();
  });

  test('displays track title', () => {
    const { getByText } = render(<Wrapper><AudioPlayerSkin {...baseProps} title="My Song" /></Wrapper>);
    expect(getByText(/My Song/)).toBeInTheDocument();
  });

  test('displays remaining time', () => {
    const { getByText } = render(<Wrapper><AudioPlayerSkin {...baseProps} duration={120} currentTime={30} /></Wrapper>);
    expect(getByText('-1:30')).toBeInTheDocument();
  });

  test('calls onPlayClick when play button clicked', () => {
    const onPlayClick = jest.fn();
    const { container } = render(<Wrapper><AudioPlayerSkin {...baseProps} onPlayClick={onPlayClick} /></Wrapper>);
    fireEvent.click(container.querySelector('[aria-label="Play"]'));
    expect(onPlayClick).toHaveBeenCalled();
  });

  test('calls onPauseClick when pause button clicked', () => {
    const onPauseClick = jest.fn();
    const { container } = render(<Wrapper><AudioPlayerSkin {...baseProps} paused={false} onPauseClick={onPauseClick} /></Wrapper>);
    fireEvent.click(container.querySelector('[aria-label="Pause"]'));
    expect(onPauseClick).toHaveBeenCalled();
  });

  test('calls onMutedClick when mute button clicked', () => {
    const onMutedClick = jest.fn();
    const { container } = render(<Wrapper><AudioPlayerSkin {...baseProps} onMutedClick={onMutedClick} /></Wrapper>);
    const muteBtn = container.querySelector('[aria-label="Mute"]');
    if (muteBtn) fireEvent.click(muteBtn);
    expect(onMutedClick).toHaveBeenCalled();
  });

  test('renders with chapters', () => {
    const chapters = [
      { title: 'Intro', startTime: 0 },
      { title: 'Main', startTime: 60 },
    ];
    const { container } = render(<Wrapper><AudioPlayerSkin {...baseProps} chapters={chapters} /></Wrapper>);
    expect(container).toBeDefined();
  });

  test('renders muted icon when muted', () => {
    const { container } = render(<Wrapper><AudioPlayerSkin {...baseProps} muted={true} /></Wrapper>);
    expect(container.querySelector('[aria-label="Unmute"]')).toBeInTheDocument();
  });

  test('shows skip buttons when playing', () => {
    const { container } = render(<Wrapper><AudioPlayerSkin {...baseProps} paused={false} /></Wrapper>);
    expect(container.querySelector('[aria-label="Skip back"]')).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Skip forward"]')).toBeInTheDocument();
  });

  test('renders with ads active', () => {
    const ads = { title: 'Ad', url: 'http://ad.com', buttonText: 'Visit', skipAfter: 5, onSkip: jest.fn(), onAdClick: jest.fn(), onAdComplete: jest.fn() };
    const { container } = render(<Wrapper><AudioPlayerSkin {...baseProps} paused={false} ads={ads} /></Wrapper>);
    expect(container).toBeDefined();
  });

  test('shows 0:00 when duration is 0', () => {
    const { getByText } = render(<Wrapper><AudioPlayerSkin {...baseProps} duration={0} currentTime={0} /></Wrapper>);
    expect(getByText('0:00')).toBeInTheDocument();
  });
});
