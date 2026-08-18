import { createWebPlayerAdapter } from '../../src/utils/webPlayerAdapter';

function createMockAudioElement() {
  return {
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    load: jest.fn(),
    removeAttribute: jest.fn(),
    src: '',
    currentTime: 0,
    duration: 180,
    volume: 1,
    muted: false,
    playbackRate: 1,
    buffered: {
      length: 1,
      end: jest.fn().mockReturnValue(90),
    },
  };
}

describe('createWebPlayerAdapter', () => {
  let audioRef;
  let adapter;

  beforeEach(() => {
    audioRef = { current: createMockAudioElement() };
    adapter = createWebPlayerAdapter(audioRef);
  });

  describe('play', () => {
    it('calls play on the audio element', () => {
      adapter.play();
      expect(audioRef.current.play).toHaveBeenCalled();
    });

    it('does not throw when ref is null', () => {
      audioRef.current = null;
      expect(() => adapter.play()).not.toThrow();
    });
  });

  describe('pause', () => {
    it('calls pause on the audio element', () => {
      adapter.pause();
      expect(audioRef.current.pause).toHaveBeenCalled();
    });

    it('does not throw when ref is null', () => {
      audioRef.current = null;
      expect(() => adapter.pause()).not.toThrow();
    });
  });

  describe('stop', () => {
    it('pauses, removes src, and reloads', () => {
      adapter.stop();
      expect(audioRef.current.pause).toHaveBeenCalled();
      expect(audioRef.current.removeAttribute).toHaveBeenCalledWith('src');
      expect(audioRef.current.load).toHaveBeenCalled();
    });

    it('does not throw when ref is null', () => {
      audioRef.current = null;
      expect(() => adapter.stop()).not.toThrow();
    });
  });

  describe('load', () => {
    it('sets src on the audio element', () => {
      adapter.load('https://example.com/audio.mp3');
      expect(audioRef.current.src).toBe('https://example.com/audio.mp3');
    });

    it('does not throw when ref is null', () => {
      audioRef.current = null;
      expect(() => adapter.load('https://example.com/audio.mp3')).not.toThrow();
    });
  });

  describe('seekTo', () => {
    it('sets currentTime on the audio element', () => {
      adapter.seekTo(60);
      expect(audioRef.current.currentTime).toBe(60);
    });

    it('does not throw when ref is null', () => {
      audioRef.current = null;
      expect(() => adapter.seekTo(60)).not.toThrow();
    });
  });

  describe('setVolume', () => {
    it('sets volume on the audio element', () => {
      adapter.setVolume(0.7);
      expect(audioRef.current.volume).toBe(0.7);
    });

    it('does not throw when ref is null', () => {
      audioRef.current = null;
      expect(() => adapter.setVolume(0.7)).not.toThrow();
    });
  });

  describe('mute', () => {
    it('sets muted to true', () => {
      adapter.mute();
      expect(audioRef.current.muted).toBe(true);
    });

    it('does not throw when ref is null', () => {
      audioRef.current = null;
      expect(() => adapter.mute()).not.toThrow();
    });
  });

  describe('unmute', () => {
    it('sets muted to false', () => {
      audioRef.current.muted = true;
      adapter.unmute();
      expect(audioRef.current.muted).toBe(false);
    });

    it('does not throw when ref is null', () => {
      audioRef.current = null;
      expect(() => adapter.unmute()).not.toThrow();
    });
  });

  describe('setPlaybackRate', () => {
    it('sets playbackRate on the audio element', () => {
      adapter.setPlaybackRate(1.5);
      expect(audioRef.current.playbackRate).toBe(1.5);
    });

    it('does not throw when ref is null', () => {
      audioRef.current = null;
      expect(() => adapter.setPlaybackRate(1.5)).not.toThrow();
    });
  });

  describe('getDuration', () => {
    it('returns duration from audio element', () => {
      expect(adapter.getDuration()).toBe(180);
    });

    it('returns null when ref is null', () => {
      audioRef.current = null;
      expect(adapter.getDuration()).toBeNull();
    });

    it('returns null when duration is 0', () => {
      audioRef.current.duration = 0;
      expect(adapter.getDuration()).toBeNull();
    });

    it('returns null when duration is NaN', () => {
      audioRef.current.duration = NaN;
      expect(adapter.getDuration()).toBeNull();
    });
  });

  describe('getCurrentTime', () => {
    it('returns currentTime from audio element', () => {
      audioRef.current.currentTime = 30;
      expect(adapter.getCurrentTime()).toBe(30);
    });

    it('returns 0 when currentTime is 0', () => {
      audioRef.current.currentTime = 0;
      expect(adapter.getCurrentTime()).toBe(0);
    });

    it('returns null when ref is null', () => {
      audioRef.current = null;
      expect(adapter.getCurrentTime()).toBeNull();
    });
  });

  describe('getSecondsLoaded', () => {
    it('returns buffered end value', () => {
      expect(adapter.getSecondsLoaded()).toBe(90);
    });

    it('returns null when ref is null', () => {
      audioRef.current = null;
      expect(adapter.getSecondsLoaded()).toBeNull();
    });

    it('returns null when buffered length is 0', () => {
      audioRef.current.buffered = { length: 0, end: jest.fn() };
      expect(adapter.getSecondsLoaded()).toBeNull();
    });

    it('returns null when buffered is undefined', () => {
      audioRef.current.buffered = undefined;
      expect(adapter.getSecondsLoaded()).toBeNull();
    });
  });
});
