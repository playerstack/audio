import React from 'react';

const useVolume = ({ prevented, muted, videoRef, src, updateState }) => {
  // Track the volume before muting so we can restore it on unmute
  const volumeBeforeMuteRef = React.useRef(0.8);
  // Guard to ignore volumechange events triggered by our own programmatic changes
  const ignoreVolumeChangeRef = React.useRef(false);

  const onVolumeChange = React.useCallback(
    (e) => {
      if (!videoRef.current) {
        return;
      }
      if (ignoreVolumeChangeRef.current) {
        return;
      }
      let isMuted = e.target.muted;
      if (0 === e.target.volume) {
        isMuted = true;
      }
      updateState({
        volume: e.target.volume,
        muted: isMuted,
      });
    },
    [videoRef, updateState],
  );

  const onMutedClick = React.useCallback(() => {
    if (!videoRef.current) {
      return;
    }
    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    const willMute = !videoElement.muted;

    // Suppress volumechange events caused by our direct DOM manipulation
    ignoreVolumeChangeRef.current = true;

    if (willMute) {
      // Muting: remember current volume, mute the element directly.
      // Keep the volume property unchanged — muted silences independently.
      if (videoElement.volume > 0) {
        volumeBeforeMuteRef.current = videoElement.volume;
      }
      videoElement.muted = true;
      updateState({
        volume: videoElement.volume,
        muted: true,
      });
    } else {
      // Unmuting: restore previous volume
      const restoredVolume = volumeBeforeMuteRef.current || 0.8;
      videoElement.muted = false;
      videoElement.volume = restoredVolume;
      updateState({
        volume: restoredVolume,
        muted: false,
      });
    }

    // Re-enable volumechange listener after synchronous events and React's commit phase
    setTimeout(() => {
      ignoreVolumeChangeRef.current = false;
    }, 0);
  }, [videoRef, updateState]);

  const changeVolume = React.useCallback(
    (v) => {
      if (!videoRef.current) {
        return;
      }
      const videoElement = videoRef.current;
      let muted = 0 === v;
      if (videoElement) {
        videoElement.volume = v;
      }
      if (0 !== v && videoElement.muted === true) {
        muted = false;
        videoElement.muted = false;
      }
      // Remember non-zero volume for mute/unmute toggle
      if (v > 0) {
        volumeBeforeMuteRef.current = v;
      }
      updateState({
        volume: v,
        muted,
      });
    },
    [videoRef, updateState],
  );

  const updateVolumeWithCallback = React.useCallback(
    (callback) => {
      if (!videoRef.current) {
        return;
      }
      const videoElement = videoRef.current;
      const lastVolume = videoElement.volume;
      const newVolume = callback(lastVolume);
      changeVolume(newVolume);
    },
    [videoRef, changeVolume],
  );

  React.useEffect(() => {
    if (!videoRef.current) {
      return () => {};
    }
    const el = videoRef.current;
    if (!el) {
      return () => {};
    }
    el.addEventListener('volumechange', onVolumeChange);
    return () => {
      el.removeEventListener('volumechange', onVolumeChange);
    };
  }, [onVolumeChange, videoRef]);

  React.useEffect(() => {
    if (!videoRef.current) {
      return;
    }
    const el = videoRef.current;
    if (el) {
      // Sync muted state to the video element when src or muted prop changes
      if (muted) {
        el.muted = true;
      } else {
        el.muted = false;
      }
    }
  }, [src, videoRef, muted]);

  return {
    onMutedClick,
    changeVolume,
    updateVolumeWithCallback,
  };
};

export default useVolume;
