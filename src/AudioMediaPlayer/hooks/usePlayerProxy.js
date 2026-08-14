import React from 'react';

/**
 * Hook that builds stable proxy callbacks for the PlayerProxy component.
 * Simplified for audio-only usage (no multi-source quality switching).
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
  extraProps: { url },
}) => {
  const updateStateRef = React.useRef(updateState);
  updateStateRef.current = updateState;

  const callbacksRef = React.useRef({
    onBuffer, onBufferEnd, onDuration, onEnded, onError,
    onPause, onPlay, onPlayBackRateChange, onProgress,
    onReady, onSeek, onStart, onLoaded, onMount,
  });
  callbacksRef.current = {
    onBuffer, onBufferEnd, onDuration, onEnded, onError,
    onPause, onPlay, onPlayBackRateChange, onProgress,
    onReady, onSeek, onStart, onLoaded, onMount,
  };

  const seekingRef = React.useRef(playerState.seeking);
  seekingRef.current = playerState.seeking;

  const proxyMemorized = React.useMemo(
    function buildProxy() {
      return {
        onBuffer: function handleBuffer() {
          if (callbacksRef.current.onBuffer) callbacksRef.current.onBuffer.apply(null, arguments);
          updateStateRef.current(function (prev) { return Object.assign({}, prev, { isBuffering: true }); });
        },
        onBufferEnd: function handleBufferEnd() {
          if (callbacksRef.current.onBufferEnd) callbacksRef.current.onBufferEnd.apply(null, arguments);
          updateStateRef.current(function (prev) { return Object.assign({}, prev, { isBuffering: false }); });
        },
        onDuration: function handleDuration(duration) {
          if (callbacksRef.current.onDuration) callbacksRef.current.onDuration(duration);
          updateStateRef.current(function (prev) { return Object.assign({}, prev, { duration: duration }); });
        },
        onEnded: function handleEnded(e) {
          if (callbacksRef.current.onEnded) callbacksRef.current.onEnded(e);
          updateStateRef.current(function (prev) { return Object.assign({}, prev, { isEnded: true }); });
        },
        onError: function handleError(e, data, hls, HLS) {
          if (callbacksRef.current.onError) callbacksRef.current.onError(e, data, hls, HLS);
          var skipErrors = ['networkError'];
          var recoverableDetails = ['bufferStalledError', 'bufferNudgeOnStall', 'bufferAppendError', 'fragParsingError'];
          var dataType = data && data.type;
          var isRecoverable = skipErrors.indexOf(dataType) >= 0 ||
            (dataType === 'mediaError' && recoverableDetails.indexOf(data.details) >= 0);
          if (!isRecoverable) {
            updateStateRef.current(function (prev) {
              return Object.assign({}, prev, {
                kernelError: data ? { type: (dataType || 'UnknownError'), detail: ((data.error && data.error.message) || 'Something was wrong with the playback.') } : null,
                isLoading: false,
                playing: false,
              });
            });
          }
        },
        onPause: function handlePause(e) {
          if (callbacksRef.current.onPause) callbacksRef.current.onPause(e);
          updateStateRef.current(function (prev) { return Object.assign({}, prev, { playing: false }); });
        },
        onPlay: function handlePlay(e) {
          if (callbacksRef.current.onPlay) callbacksRef.current.onPlay(e);
          updateStateRef.current(function (prev) { return Object.assign({}, prev, { playing: true, isEnded: false, hasAudio: true }); });
        },
        onPlayBackRateChange: function handleRate(rate) {
          if (callbacksRef.current.onPlayBackRateChange) callbacksRef.current.onPlayBackRateChange(rate);
          updateStateRef.current(function (prev) { return Object.assign({}, prev, { playbackRate: rate }); });
        },
        onProgress: function handleProgress(state) {
          if (callbacksRef.current.onProgress) callbacksRef.current.onProgress(state);
          if (!seekingRef.current) {
            updateStateRef.current(function (prev) { return Object.assign({}, prev, { played: state.playedSeconds, loaded: state.loaded }); });
          }
        },
        onReady: function handleReady(e) {
          if (callbacksRef.current.onReady) callbacksRef.current.onReady(e);
          updateStateRef.current(function (prev) { return Object.assign({}, prev, { isLoading: false }); });
        },
        onSeek: function handleSeek(time) {
          if (callbacksRef.current.onSeek) callbacksRef.current.onSeek(time);
          updateStateRef.current(function (prev) { return Object.assign({}, prev, { seek: time }); });
        },
        onStart: function handleStart() {
          if (callbacksRef.current.onStart) callbacksRef.current.onStart();
        },
        onLoaded: function handleLoaded() {
          if (callbacksRef.current.onLoaded) callbacksRef.current.onLoaded.apply(null, arguments);
        },
        onMount: function handleMount() {
          if (callbacksRef.current.onMount) callbacksRef.current.onMount.apply(null, arguments);
        },
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return Object.assign({}, proxyMemorized, { videoUrl: url });
};

export default usePlayerProxy;
