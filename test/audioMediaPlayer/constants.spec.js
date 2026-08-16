import { playerStateInitial } from '../../src/AudioMediaPlayer/AudioMediaPlayer.constants';

describe('AudioMediaPlayer.constants', () => {
  test('playerStateInitial has expected defaults', () => {
    expect(playerStateInitial.playing).toBe(false);
    expect(playerStateInitial.volume).toBe(0.8);
    expect(playerStateInitial.playbackRate).toBe(1);
    expect(playerStateInitial.isLoading).toBe(true);
    expect(playerStateInitial.isBuffering).toBe(false);
    expect(playerStateInitial.isEnded).toBe(false);
    expect(playerStateInitial.seeking).toBe(false);
    expect(playerStateInitial.isMuted).toBe(false);
    expect(playerStateInitial.duration).toBe(0);
  });

  test('does not include video-specific state', () => {
    expect(playerStateInitial).not.toHaveProperty('isFullScreen');
    expect(playerStateInitial).not.toHaveProperty('isPIP');
    expect(playerStateInitial).not.toHaveProperty('playbackQuality');
    expect(playerStateInitial).not.toHaveProperty('videoUrl');
    expect(playerStateInitial).not.toHaveProperty('activeCaption');
  });
});
