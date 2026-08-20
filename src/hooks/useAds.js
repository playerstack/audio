import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Hook to manage ads overlay state.
 *
 * Centralizes all ad logic including pre-roll activation (ad only activates
 * after first play), skip timer, ad completion detection, media session
 * blocking (via platform adapter), and ad click handling.
 *
 * Previously lived in @playerstack/core/hooks. Now local to audio since core
 * no longer exports React hooks.
 */
export function useAds({ ads, currentTime, duration, paused, ended, onPauseClick, platform }) {
  const adsConfigured = ads !== null && ads !== undefined;

  const [adStarted, setAdStarted] = useState(() => {
    return adsConfigured && !paused && !ended;
  });

  // Detect transition from paused to playing (first play triggers ad)
  const prevPausedRef = useRef(paused);
  useEffect(() => {
    if (adsConfigured && !adStarted && prevPausedRef.current && !paused) {
      setAdStarted(true);
    }
    prevPausedRef.current = paused;
  }, [adsConfigured, adStarted, paused]);

  // Reset when ads prop removed; auto-activate if already playing when ads prop appears
  const prevAdsConfiguredRef = useRef(adsConfigured);
  useEffect(() => {
    if (!adsConfigured) {
      setAdStarted(false);
    } else if (adsConfigured && !prevAdsConfiguredRef.current && !paused && !ended) {
      setAdStarted(true);
    }
    prevAdsConfiguredRef.current = adsConfigured;
  }, [adsConfigured, paused, ended]);

  const isAdActive = adsConfigured && adStarted;

  const hasSkipTimer = isAdActive && typeof ads.skipAfter === 'number' && ads.skipAfter > 0;

  const canSkip = useMemo(() => {
    if (!isAdActive || !hasSkipTimer) return false;
    return currentTime >= ads.skipAfter;
  }, [isAdActive, hasSkipTimer, currentTime, ads]);

  const skipCountdown = useMemo(() => {
    if (!isAdActive || !hasSkipTimer) return 0;
    const remaining = Math.ceil(ads.skipAfter - currentTime);
    return remaining > 0 ? remaining : 0;
  }, [isAdActive, hasSkipTimer, currentTime, ads]);

  const adProgress = useMemo(() => {
    if (!isAdActive) return 0;
    if (hasSkipTimer) {
      const progress = currentTime / ads.skipAfter;
      return progress > 1 ? 1 : progress;
    }
    if (duration > 0) {
      return currentTime / duration;
    }
    return 0;
  }, [isAdActive, hasSkipTimer, currentTime, duration, ads]);

  // Detect ad video ended
  const adCompletedRef = useRef(false);
  useEffect(() => {
    if (isAdActive && ended && !adCompletedRef.current) {
      adCompletedRef.current = true;
      if (ads.onAdComplete) {
        ads.onAdComplete();
      }
    }
    if (!isAdActive) {
      adCompletedRef.current = false;
    }
  }, [isAdActive, ended, ads]);

  // Block media session via platform adapter during ads
  const blockCleanupRef = useRef(null);
  useEffect(() => {
    if (isAdActive && platform?.blockMediaSession) {
      blockCleanupRef.current = platform.blockMediaSession();
    }
    return () => {
      if (blockCleanupRef.current) {
        blockCleanupRef.current();
        blockCleanupRef.current = null;
      }
    };
  }, [isAdActive, platform]);

  const onSkipClick = useCallback(() => {
    if (isAdActive && ads?.onSkip) {
      ads.onSkip();
    }
  }, [isAdActive, ads]);

  const onAdClick = useCallback(() => {
    if (isAdActive) {
      if (onPauseClick) onPauseClick();
      if (ads.onAdClick) ads.onAdClick();
      if (ads.url && platform?.openUrl) platform.openUrl(ads.url);
    }
  }, [isAdActive, ads, onPauseClick, platform]);

  return { isAdActive, hasSkipTimer, canSkip, skipCountdown, adProgress, onSkipClick, onAdClick };
}
