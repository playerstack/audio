import React from 'react';

/**
 * Hook to manage ads overlay state.
 *
 * Centralizes all ad logic including pre-roll activation (ad only activates
 * after first play), skip timer, ad completion detection, media session
 * blocking, and ad click handling.
 *
 * @param {object} params
 * @param {object|null} params.ads - Ads configuration object
 * @param {number} params.currentTime - Current playback time in seconds
 * @param {number} params.duration - Video duration in seconds
 * @param {boolean} params.paused - Whether media is paused
 * @param {boolean} params.ended - Whether media has ended
 * @param {function} params.onPauseClick - Callback to pause media
 * @returns {object} Ad state and handlers
 */
const useAds = ({ ads, currentTime, duration, paused, ended, onPauseClick }) => {
  const adsConfigured = ads !== null && ads !== undefined;

  // Pre-roll: ad activates only after first play
  const [adStarted, setAdStarted] = React.useState(() => {
    // If already playing on mount (e.g., autoplay), activate immediately
    return adsConfigured && !paused && !ended;
  });

  // Detect transition from paused to playing (first play triggers ad)
  const prevPausedRef = React.useRef(paused);
  React.useEffect(() => {
    if (adsConfigured && !adStarted && prevPausedRef.current && !paused) {
      setAdStarted(true);
    }
    prevPausedRef.current = paused;
  }, [adsConfigured, adStarted, paused]);

  // Reset when ads prop removed; auto-activate if already playing when ads prop appears
  const prevAdsConfiguredRef = React.useRef(adsConfigured);
  React.useEffect(() => {
    if (!adsConfigured) {
      setAdStarted(false);
    } else if (adsConfigured && !prevAdsConfiguredRef.current && !paused && !ended) {
      // ads prop just appeared while already playing — activate immediately
      setAdStarted(true);
    }
    prevAdsConfiguredRef.current = adsConfigured;
  }, [adsConfigured, paused, ended]);

  // The effective active state: configured + started
  const isAdActive = adsConfigured && adStarted;

  // Whether skip button has configurable time (skipAfter is a number)
  const hasSkipTimer = isAdActive && typeof ads.skipAfter === 'number' && ads.skipAfter > 0;

  // Whether user can skip (elapsed time >= skipAfter)
  const canSkip = React.useMemo(() => {
    if (!isAdActive) return false;
    if (!hasSkipTimer) return false;
    return currentTime >= ads.skipAfter;
  }, [isAdActive, hasSkipTimer, currentTime, ads]);

  // Countdown seconds remaining before skip is available
  const skipCountdown = React.useMemo(() => {
    if (!isAdActive || !hasSkipTimer) return 0;
    const remaining = Math.ceil(ads.skipAfter - currentTime);
    return remaining > 0 ? remaining : 0;
  }, [isAdActive, hasSkipTimer, currentTime, ads]);

  // Progress of ad timer (0 to 1)
  const adProgress = React.useMemo(() => {
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

  // Detect ad video ended — call onAdComplete
  const adCompletedRef = React.useRef(false);
  React.useEffect(() => {
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

  // Block media session seek controls during ads
  React.useEffect(() => {
    if (!isAdActive || typeof navigator === 'undefined' || !navigator.mediaSession) return;

    const block = () => {};
    navigator.mediaSession.setActionHandler('seekbackward', block);
    navigator.mediaSession.setActionHandler('seekforward', block);
    navigator.mediaSession.setActionHandler('seekto', block);
    navigator.mediaSession.setActionHandler('previoustrack', block);
    navigator.mediaSession.setActionHandler('nexttrack', block);

    return () => {
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
      navigator.mediaSession.setActionHandler('seekto', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    };
  }, [isAdActive]);

  const onSkipClick = React.useCallback(() => {
    if (isAdActive && ads.onSkip) {
      ads.onSkip();
    }
  }, [isAdActive, ads]);

  // Ad click: pause, notify, open URL
  const onAdClick = React.useCallback(() => {
    if (isAdActive) {
      if (onPauseClick) {
        onPauseClick();
      }
      if (ads.onAdClick) {
        ads.onAdClick();
      }
      if (ads.url) {
        window.open(ads.url, '_blank', 'noopener,noreferrer');
      }
    }
  }, [isAdActive, ads, onPauseClick]);

  return {
    isAdActive,
    hasSkipTimer,
    canSkip,
    skipCountdown,
    adProgress,
    onSkipClick,
    onAdClick,
  };
};

export default useAds;
