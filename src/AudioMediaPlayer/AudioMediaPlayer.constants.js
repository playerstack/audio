import { playerStateInitial as coreInitial } from '@playerstack/core';

// Audio player uses a subset of the core initial state (no fullscreen, PiP, quality)
export const playerStateInitial = {
  kernelError: coreInitial.kernelError,
  seeking: coreInitial.seeking,
  seek: coreInitial.seek,
  played: coreInitial.played,
  loaded: coreInitial.loaded,
  duration: coreInitial.duration,
  isEnded: coreInitial.isEnded,
  isLoading: coreInitial.isLoading,
  isBuffering: coreInitial.isBuffering,
  volume: coreInitial.volume,
  playbackRate: coreInitial.playbackRate,
  hasAudio: coreInitial.hasAudio,
  loop: coreInitial.loop,
  playing: coreInitial.playing,
  isMuted: coreInitial.isMuted,
};
