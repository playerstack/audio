import { usePlayerCallbackProxy } from '@playerstack/core/hooks';

/**
 * Hook that builds stable proxy callbacks for the PlayerProxy component.
 * Simplified for audio-only usage (no multi-source quality switching).
 *
 * Delegates to core's usePlayerCallbackProxy for the stable proxy pattern
 * and error classification logic.
 */
const usePlayerProxy = ({
  onBuffer,
  onBufferEnd,
  onDuration,
  onEnded,
  onError,
  onPause,
  onPlay,
  onPlayBackRateChange,
  onProgress,
  onReady,
  onSeek,
  onStart,
  onLoaded,
  onMount,
  updateState,
  playerState,
  extraProps,
}) => {
  // Audio always has audio — force prevented=true so the core hook resolves hasAudio=true
  return usePlayerCallbackProxy({
    onBuffer,
    onBufferEnd,
    onDuration,
    onEnded,
    onError,
    onPause,
    onPlay,
    onPlayBackRateChange,
    onProgress,
    onReady,
    onSeek,
    onStart,
    onLoaded,
    onMount,
    updateState,
    playerState,
    extraProps: { ...extraProps, prevented: true },
  });
};

export default usePlayerProxy;
