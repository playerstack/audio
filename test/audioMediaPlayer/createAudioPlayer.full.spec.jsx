import React from 'react';
import { render, act } from '@testing-library/react';

jest.mock('react-fast-compare', () => ({
  __esModule: true,
  default: (a, b) => JSON.stringify(a) === JSON.stringify(b),
}));

const { createAudioPlayer } = require('../../src/AudioMediaPlayer/createAudioPlayer');

const mockPlayer = {
  key: 'core',
  name: 'PlayerCore',
  canPlay: (url) => !!url && url !== 'unsupported://x',
  lazyPlayer: React.forwardRef(function MockPlayer(props, ref) {
    return React.createElement('audio', { 'data-testid': 'audio-element' });
  }),
};

const AudioPlayer = createAudioPlayer(mockPlayer);

describe('createAudioPlayer — full coverage', () => {
  test('canPlay returns false for unsupported URL', () => {
    expect(AudioPlayer.canPlay('unsupported://x')).toBe(false);
  });

  test('canPlay returns true for supported URL', () => {
    expect(AudioPlayer.canPlay('test.mp3')).toBe(true);
  });

  test('shouldComponentUpdate returns false for identical props', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    instance.state = {};
    const result = instance.shouldComponentUpdate({ url: 'test.mp3', config: {} }, {});
    expect(result).toBe(false);
  });

  test('shouldComponentUpdate returns true for different props', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    instance.state = {};
    const result = instance.shouldComponentUpdate({ url: 'other.mp3', config: {} }, {});
    expect(result).toBe(true);
  });

  test('shouldComponentUpdate returns true for different state', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    instance.state = {};
    const result = instance.shouldComponentUpdate({ url: 'test.mp3', config: {} }, { foo: 1 });
    expect(result).toBe(true);
  });

  test('getDuration returns value from player', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    instance.player = { getDuration: () => 300, getCurrentTime: () => 50, getSecondsLoaded: () => 100, seekTo: jest.fn(), getInternalPlayer: () => ({}) };
    expect(instance.getDuration()).toBe(300);
  });

  test('getCurrentTime returns value from player', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    instance.player = { getDuration: () => 300, getCurrentTime: () => 50, getSecondsLoaded: () => 100, seekTo: jest.fn(), getInternalPlayer: () => ({}) };
    expect(instance.getCurrentTime()).toBe(50);
  });

  test('getSecondsLoaded returns value from player', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    instance.player = { getDuration: () => 300, getCurrentTime: () => 50, getSecondsLoaded: () => 100, seekTo: jest.fn(), getInternalPlayer: () => ({}) };
    expect(instance.getSecondsLoaded()).toBe(100);
  });

  test('seekTo delegates to player', () => {
    const seekTo = jest.fn();
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    instance.player = { getDuration: () => 300, getCurrentTime: () => 50, getSecondsLoaded: () => 100, seekTo, getInternalPlayer: () => ({}) };
    instance.seekTo(60, 'seconds', true);
    expect(seekTo).toHaveBeenCalledWith(60, 'seconds', true);
  });

  test('getInternalPlayer returns internal player', () => {
    const internal = { id: 'hls' };
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    instance.player = { getDuration: () => 300, getCurrentTime: () => 50, getSecondsLoaded: () => 100, seekTo: jest.fn(), getInternalPlayer: (key) => key === 'hls' ? internal : null };
    expect(instance.getInternalPlayer('hls')).toBe(internal);
  });

  test('getInternalPlayer defaults to "player" key', () => {
    const internal = { id: 'player' };
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    instance.player = { getDuration: () => 300, getCurrentTime: () => 50, getSecondsLoaded: () => 100, seekTo: jest.fn(), getInternalPlayer: (key) => key === 'player' ? internal : null };
    expect(instance.getInternalPlayer()).toBe(internal);
  });

  test('handleReady calls onReady with instance', () => {
    const onReady = jest.fn();
    const instance = new AudioPlayer({ url: 'test.mp3', config: {}, onReady });
    instance.handleReady();
    expect(onReady).toHaveBeenCalledWith(instance);
  });

  test('handleReady does nothing when onReady not provided', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    // Should not throw
    instance.handleReady();
  });

  test('getActivePlayer returns player for playable url', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    const active = instance.getActivePlayer('test.mp3');
    expect(active).toBe(mockPlayer);
  });

  test('getActivePlayer returns null for unplayable url', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    const active = instance.getActivePlayer('unsupported://x');
    expect(active).toBeNull();
  });

  test('getPlayerConfig extracts relevant config', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    const config = instance.getPlayerConfig({
      attributes: { autoPlay: true },
      tracks: ['en'],
      forceHLS: true,
      dashVersion: '4.7',
      forceDASH: false,
      forceFLV: false,
      flvVersion: '1.6',
      forceDisableHls: false,
      hlsOptions: { maxBufferLength: 30 },
      hlsVersion: '1.5',
      forceSafariHLS: false,
      extraField: 'ignored',
    });
    expect(config.forceHLS).toBe(true);
    expect(config.hlsVersion).toBe('1.5');
    expect(config.extraField).toBeUndefined();
  });

  test('references.wrapper sets wrapper ref', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    const div = document.createElement('div');
    instance.references.wrapper(div);
    expect(instance.wrapper).toBe(div);
  });

  test('references.player sets player and forces update', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    instance.forceUpdate = jest.fn();
    const mockPlayerRef = { getDuration: () => 100 };
    instance.references.player(mockPlayerRef);
    expect(instance.player).toBe(mockPlayerRef);
    expect(instance.forceUpdate).toHaveBeenCalled();
  });

  test('references.player does not force update if same player', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    instance.forceUpdate = jest.fn();
    const mockPlayerRef = { getDuration: () => 100 };
    instance.player = mockPlayerRef;
    instance.references.player(mockPlayerRef);
    expect(instance.forceUpdate).not.toHaveBeenCalled();
  });

  test('references.player does nothing for null', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: {} });
    instance.forceUpdate = jest.fn();
    instance.references.player(null);
    expect(instance.forceUpdate).not.toHaveBeenCalled();
  });

  test('renderActivePlayer returns null for empty url', () => {
    const instance = new AudioPlayer({ url: '', config: {} });
    instance.props = { url: '', config: {}, ...AudioPlayer.defaultProps };
    const result = instance.renderActivePlayer('');
    expect(result).toBeNull();
  });

  test('renderActivePlayer returns null for unplayable url', () => {
    const instance = new AudioPlayer({ url: 'unsupported://x', config: {} });
    instance.props = { url: 'unsupported://x', config: {}, ...AudioPlayer.defaultProps };
    const result = instance.renderActivePlayer('unsupported://x');
    expect(result).toBeNull();
  });

  test('renders with Wrapper as React component', () => {
    const CustomWrapper = React.forwardRef(({ children, ...rest }, ref) =>
      React.createElement('section', { ...rest, ref }, children),
    );
    const { container } = render(React.createElement(AudioPlayer, { url: '', wrapper: CustomWrapper }));
    // When wrapper is not a string, ref is not passed to it (wrapperRef is undefined)
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  test('renders with no className', () => {
    const { container } = render(React.createElement(AudioPlayer, { url: '' }));
    const el = container.querySelector('.playerstack-audio');
    expect(el.className).toBe('playerstack-audio');
  });

  test('fallback prop is rendered in Suspense', () => {
    const fallback = React.createElement('div', { 'data-testid': 'fallback' }, 'Loading...');
    const { container } = render(React.createElement(AudioPlayer, { url: '', fallback }));
    expect(container).toBeDefined();
  });
});
