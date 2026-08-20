import { useRef, useMemo } from 'react';

// ---------- Defaults ----------

const DEFAULT_RECOVERABLE_ERROR_TYPES = ['networkError'];
const DEFAULT_RECOVERABLE_ERROR_DETAILS = [
  'bufferStalledError',
  'bufferNudgeOnStall',
  'bufferAppendError',
  'fragParsingError',
];

// ---------- Hook ----------

/**
 * Creates a stable object of callback proxies that forward lifecycle events
 * from a player component (AudioElement) to the consumer's callbacks.
 *
 * Callbacks are stored in refs so the proxy object maintains referential
 * stability across renders.
 *
 * Additionally wraps onReady to call updateState({ isLoading: false }) and
 * wraps onError with configurable error classification: some errors are
 * recoverable (ignored), others are fatal (set kernelError).
 *
 * Previously lived in @playerstack/core/hooks. Now local to audio since core
 * no longer exports React hooks.
 */
export function usePlayerCallbackProxy(params) {
  const {
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
    recoverableErrorTypes = DEFAULT_RECOVERABLE_ERROR_TYPES,
    recoverableErrorDetails = DEFAULT_RECOVERABLE_ERROR_DETAILS,
  } = params;

  // Keep updateState in a ref for stable closures
  const updateStateRef = useRef(updateState);
  updateStateRef.current = updateState;

  // Keep all consumer callbacks in refs so the proxy object stays stable
  const callbacksRef = useRef({
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
  });
  callbacksRef.current = {
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
  };

  // Keep reactive values in refs for the proxy closures
  const seekingRef = useRef(playerState.seeking);
  seekingRef.current = playerState.seeking;

  const preventedRef = useRef(extraProps.prevented);
  preventedRef.current = extraProps.prevented;

  // Error classification refs
  const recoverableTypesRef = useRef(recoverableErrorTypes);
  recoverableTypesRef.current = recoverableErrorTypes;

  const recoverableDetailsRef = useRef(recoverableErrorDetails);
  recoverableDetailsRef.current = recoverableErrorDetails;

  // Derive videoUrl from extraProps
  const videoUrl =
    extraProps.url ?? (extraProps.sources && extraProps.sources.length > 0 ? extraProps.sources[0].src : null);

  // Build proxy object once — uses refs to always read latest callback/state
  const proxy = useMemo(
    () => ({
      onBuffer: () => {
        if (callbacksRef.current.onBuffer) callbacksRef.current.onBuffer();
        updateStateRef.current((prev) => ({ ...prev, isBuffering: true }));
      },
      onBufferEnd: () => {
        if (callbacksRef.current.onBufferEnd) callbacksRef.current.onBufferEnd();
        updateStateRef.current((prev) => ({ ...prev, isBuffering: false }));
      },
      onDuration: (duration) => {
        if (callbacksRef.current.onDuration) callbacksRef.current.onDuration(duration);
        updateStateRef.current((prev) => ({ ...prev, duration }));
      },
      onEnded: () => {
        if (callbacksRef.current.onEnded) callbacksRef.current.onEnded();
        // Clear `playing` alongside `isEnded` so the skin renders the replay state
        // (paused/ended) consistently and auto-hide keeps controls visible.
        updateStateRef.current((prev) => ({ ...prev, isEnded: true, playing: false }));
      },
      onError: (error, data, instance, sdk) => {
        if (callbacksRef.current.onError) callbacksRef.current.onError(error, data, instance, sdk);
        const dataType = data?.type;
        const dataDetails = data?.details;
        const isRecoverable =
          recoverableTypesRef.current.includes(dataType) ||
          (dataType === 'mediaError' && recoverableDetailsRef.current.includes(dataDetails));

        if (!isRecoverable) {
          updateStateRef.current((prev) => ({
            ...prev,
            kernelError: data
              ? {
                  type: dataType || 'UnknownError',
                  detail: data?.error?.message || 'Something was wrong with the playback. Please try again.',
                }
              : null,
            isLoading: false,
            playing: false,
          }));
        }
      },
      onPause: () => {
        if (callbacksRef.current.onPause) callbacksRef.current.onPause();
        updateStateRef.current((prev) => ({ ...prev, playing: false }));
      },
      onPlay: (event) => {
        if (callbacksRef.current.onPlay) callbacksRef.current.onPlay(event);
        updateStateRef.current((prev) => {
          const audioFromEvent = event?.hasAudio ?? false;
          const resolvedHasAudio = preventedRef.current ? true : audioFromEvent || prev.hasAudio || false;
          return { ...prev, playing: true, isEnded: false, hasAudio: resolvedHasAudio };
        });
      },
      onPlayBackRateChange: (rate) => {
        if (callbacksRef.current.onPlayBackRateChange) callbacksRef.current.onPlayBackRateChange(rate);
        updateStateRef.current((prev) => ({ ...prev, playbackRate: rate }));
      },
      onProgress: (state) => {
        if (callbacksRef.current.onProgress) callbacksRef.current.onProgress(state);
        if (!seekingRef.current) {
          updateStateRef.current((prev) => ({
            ...prev,
            played: state.playedSeconds ?? state.played,
            loaded: state.loaded,
            bufferedRanges: state.bufferedRanges || [],
          }));
        }
      },
      onReady: () => {
        if (callbacksRef.current.onReady) callbacksRef.current.onReady();
        updateStateRef.current((prev) => ({ ...prev, isLoading: false }));
      },
      onSeek: (time) => {
        if (callbacksRef.current.onSeek) callbacksRef.current.onSeek(time);
        updateStateRef.current((prev) => ({ ...prev, seek: time }));
      },
      onStart: () => {
        if (callbacksRef.current.onStart) callbacksRef.current.onStart();
      },
      onLoaded: () => {
        if (callbacksRef.current.onLoaded) callbacksRef.current.onLoaded();
      },
      onMount: () => {
        if (callbacksRef.current.onMount) callbacksRef.current.onMount();
      },
    }),
    // Empty deps — stable forever, reads current values from refs
    // eslint-disable-next-line react-hooks/exhaustive-deps — proxy must remain stable; all values read from refs
    [],
  );

  return { ...proxy, videoUrl };
}
