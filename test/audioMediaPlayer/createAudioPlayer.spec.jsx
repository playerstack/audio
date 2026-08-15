import React from 'react';
import { render } from '@testing-library/react';

jest.mock('react-fast-compare', () => ({
  __esModule: true,
  default: (a, b) => JSON.stringify(a) === JSON.stringify(b),
}));

const { createAudioPlayer } = require('../../src/AudioMediaPlayer/createAudioPlayer');

const mockPlayer = {
  key: 'core',
  name: 'PlayerCore',
  canPlay: (url) => !!url,
  lazyPlayer: React.forwardRef(function MockPlayer(props, ref) {
    return React.createElement('audio', { 'data-testid': 'audio-element' });
  }),
};

const AudioPlayer = createAudioPlayer(mockPlayer);

describe('createAudioPlayer', () => {
  test('creates component with displayName', () => {
    expect(AudioPlayer.displayName).toBe('AudioPlayer');
  });

  test('has propTypes and defaultProps', () => {
    expect(AudioPlayer.propTypes).toBeDefined();
    expect(AudioPlayer.defaultProps).toBeDefined();
  });

  test('canPlay delegates to player.canPlay', () => {
    expect(AudioPlayer.canPlay('test.mp3')).toBe(true);
    expect(AudioPlayer.canPlay('')).toBe(false);
  });

  test('renders wrapper div with playerstack-audio class', () => {
    const { container } = render(React.createElement(AudioPlayer, { url: '' }));
    expect(container.querySelector('.playerstack-audio')).toBeInTheDocument();
  });

  test('renders with custom className', () => {
    const { container } = render(React.createElement(AudioPlayer, { url: '', className: 'custom' }));
    expect(container.querySelector('.playerstack-audio.custom')).toBeInTheDocument();
  });

  test('renders wrapper as section when wrapper prop is section', () => {
    const { container } = render(React.createElement(AudioPlayer, { url: '', wrapper: 'section' }));
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  test('renders nothing inside wrapper when url is empty', () => {
    const { queryByTestId } = render(React.createElement(AudioPlayer, { url: '' }));
    expect(queryByTestId('audio-element')).not.toBeInTheDocument();
  });

  test('defaultProps has correct values', () => {
    expect(AudioPlayer.defaultProps.playing).toBe(false);
    expect(AudioPlayer.defaultProps.loop).toBe(false);
    expect(AudioPlayer.defaultProps.muted).toBe(false);
    expect(AudioPlayer.defaultProps.playbackRate).toBe(1);
    expect(AudioPlayer.defaultProps.volume).toBeNull();
    expect(AudioPlayer.defaultProps.wrapper).toBe('div');
    expect(AudioPlayer.defaultProps.language).toBe('en');
  });

  test('getConfig merges with defaults', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', config: { hlsVersion: '2.0.0' } });
    const config = instance.getConfig('test.mp3', 'core');
    expect(config.hlsVersion).toBe('2.0.0');
  });

  test('getAttributes omits known props', () => {
    const instance = new AudioPlayer({ url: 'test.mp3', title: 'Test', 'data-custom': 'val' });
    const attrs = instance.getAttributes();
    expect(attrs['data-custom']).toBe('val');
    expect(attrs.url).toBeUndefined();
    expect(attrs.title).toBeUndefined();
  });

  test('getDuration returns null when no player', () => {
    const instance = new AudioPlayer({ url: '' });
    expect(instance.getDuration()).toBeNull();
  });

  test('getCurrentTime returns null when no player', () => {
    const instance = new AudioPlayer({ url: '' });
    expect(instance.getCurrentTime()).toBeNull();
  });

  test('getSecondsLoaded returns null when no player', () => {
    const instance = new AudioPlayer({ url: '' });
    expect(instance.getSecondsLoaded()).toBeNull();
  });

  test('seekTo does nothing when no player', () => {
    const instance = new AudioPlayer({ url: '' });
    expect(instance.seekTo(10)).toBeNull();
  });

  test('getInternalPlayer returns null when no player', () => {
    const instance = new AudioPlayer({ url: '' });
    expect(instance.getInternalPlayer()).toBeNull();
  });
});
