import { useCallback, useEffect, useRef } from 'react';

/**
 * Platform-agnostic volume management hook.
 *
 * All platform I/O goes through the injected VolumeAdapter — no browser globals.
 * Preserves volume-before-mute memory and an ignore-own-changes guard to prevent
 * feedback loops when programmatic changes fire the adapter's onVolumeChange callback.
 *
 * Previously lived in @playerstack/core/hooks. Now local to audio since core
 * no longer exports React hooks.
 */
export function useVolume({ adapter, muted, updateState }) {
  const volumeBeforeMuteRef = useRef(0.8);
  const ignoreOwnChangeRef = useRef(false);
  const ignoreTimerRef = useRef(null);

  const updateStateRef = useRef(updateState);
  updateStateRef.current = updateState;

  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;

  const setIgnoreGuard = useCallback(() => {
    ignoreOwnChangeRef.current = true;
    if (ignoreTimerRef.current !== null) {
      clearTimeout(ignoreTimerRef.current);
    }
    ignoreTimerRef.current = setTimeout(() => {
      ignoreOwnChangeRef.current = false;
      ignoreTimerRef.current = null;
    }, 50);
  }, []);

  const onMutedClick = useCallback(() => {
    const a = adapterRef.current;
    const willMute = !a.getMuted();

    setIgnoreGuard();

    if (willMute) {
      const currentVol = a.getVolume();
      if (currentVol > 0) {
        volumeBeforeMuteRef.current = currentVol;
      }
      a.setMuted(true);
      updateStateRef.current({ volume: currentVol, muted: true });
    } else {
      const restoredVolume = volumeBeforeMuteRef.current || 0.8;
      a.setMuted(false);
      a.setVolume(restoredVolume);
      updateStateRef.current({ volume: restoredVolume, muted: false });
    }
  }, [setIgnoreGuard]);

  const changeVolume = useCallback(
    (v) => {
      const a = adapterRef.current;
      let isMuted = v === 0;

      setIgnoreGuard();
      a.setVolume(v);

      if (v !== 0 && a.getMuted()) {
        isMuted = false;
        a.setMuted(false);
      }

      if (v > 0) {
        volumeBeforeMuteRef.current = v;
      }

      updateStateRef.current({ volume: v, muted: isMuted });
    },
    [setIgnoreGuard],
  );

  const updateVolumeWithCallback = useCallback(
    (cb) => {
      const a = adapterRef.current;
      const lastVolume = a.getVolume();
      const newVolume = cb(lastVolume);
      changeVolume(newVolume);
    },
    [changeVolume],
  );

  // Subscribe to external volume changes via adapter
  useEffect(() => {
    const unsubscribe = adapter.onVolumeChange((volume, isMuted) => {
      if (ignoreOwnChangeRef.current) return;
      const effectiveMuted = isMuted || volume === 0;
      updateStateRef.current({ volume, muted: effectiveMuted });
    });

    return unsubscribe;
  }, [adapter]);

  // Sync muted prop to adapter when it changes externally
  useEffect(() => {
    setIgnoreGuard();
    adapter.setMuted(muted);
  }, [muted, adapter, setIgnoreGuard]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (ignoreTimerRef.current !== null) {
        clearTimeout(ignoreTimerRef.current);
      }
    };
  }, []);

  return { onMutedClick, changeVolume, updateVolumeWithCallback };
}
