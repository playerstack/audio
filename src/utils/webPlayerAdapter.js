/**
 * Web PlayerAdapter wrapping an HTMLAudioElement for use with usePlayerOrchestration.
 *
 * This is the adapter equivalent of the class-based PlayerProxy for new components
 * that want to adopt the hook-based pattern from @playerstack/core/hooks.
 * The existing PlayerProxy class component remains functional for current consumers.
 *
 * @param {React.RefObject<HTMLAudioElement>} audioRef - ref to the underlying <audio> element
 * @returns {import('@playerstack/core/adapters').PlayerAdapter}
 */
export function createWebPlayerAdapter(audioRef) {
  return {
    play: () => {
      if (audioRef.current) audioRef.current.play().catch(() => {});
    },
    pause: () => {
      if (audioRef.current) audioRef.current.pause();
    },
    stop: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
    },
    load: (url) => {
      if (audioRef.current) audioRef.current.src = url;
    },
    seekTo: (seconds) => {
      if (audioRef.current) audioRef.current.currentTime = seconds;
    },
    setVolume: (v) => {
      if (audioRef.current) audioRef.current.volume = v;
    },
    mute: () => {
      if (audioRef.current) audioRef.current.muted = true;
    },
    unmute: () => {
      if (audioRef.current) audioRef.current.muted = false;
    },
    setPlaybackRate: (rate) => {
      if (audioRef.current) audioRef.current.playbackRate = rate;
    },
    getDuration: () => audioRef.current?.duration || null,
    getCurrentTime: () => audioRef.current?.currentTime ?? null,
    getSecondsLoaded: () => {
      const el = audioRef.current;
      if (!el || !el.buffered || el.buffered.length === 0) return null;
      return el.buffered.end(el.buffered.length - 1);
    },
  };
}
