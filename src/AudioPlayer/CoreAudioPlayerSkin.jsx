import React from 'react';
import PropTypes from 'prop-types';

import {
  PlayerstackMediaController,
  PlayerstackAudioControls,
  PlayerstackVolume,
  PlayerstackSettings,
  PlayerstackChapters,
  PlayerstackAdOverlay,
  PlayerstackNavButtons,
} from '@adapter/elements';
import { useCoreMediaBridge } from '@hooks/useCoreMediaBridge';
import { useAppDispatch } from '@context/index';

/**
 * `CoreAudioPlayerSkin` renders the audio player UI by COMPOSING Core's `playerstack-*`
 * UI_Elements (through the React_Adapter) inside a `playerstack-media-controller`,
 * replacing the former `styled-components`-based `AudioPlayerSkin` subtree (tasks 15.1/15.5;
 * the old styled subtree and its CSS-in-JS are removed in task 15.2, and the CSS is ported
 * to Core's `playerstack.css` in task 15.4).
 *
 * The compact audio cluster (play/pause + current-time/duration read-out + progress/seek
 * bar) is provided by `playerstack-audio-controls` (Table 22-A). Around it the skin composes
 * `playerstack-volume` (mute + volume slider), `playerstack-settings` (speed only, Table
 * 22-B), `playerstack-chapters` (chapter markers/title), `playerstack-nav-buttons` (prev/next
 * track navigation) and `playerstack-ad-overlay` (ads + skip-ad). The track metadata
 * (title + artist + poster) are audio-skin-specific presentational bits rendered as plain
 * elements around the Core controls; their CSS ports in task 15.4.
 *
 * Data flow (interim bridge, preserving Functional_Parity):
 *   - The `playerstack-media-controller` owns the shared reactive store. `useCoreMediaBridge`
 *     mirrors the existing React audio playback state INTO that store every render, so the
 *     Core elements reflect the same playing/time/volume/etc. as the previous skin (Req 10.1,
 *     10.2).
 *   - Each interactive Core element exposes its request events as React `on*` callbacks
 *     (via `createReactElement`); those are wired to the EXISTING audio playback handlers
 *     (`onPlayClick`, `onPauseClick`, `changeCurrentTime`, `changeVolume`, `onMutedClick`,
 *     `changePlaybackRate`, `onPrevious`, `onNext`, and the `ads` callbacks), so
 *     play/pause/seek/volume/rate/prev/next/ad-skip keep working with the same names,
 *     signatures and defaults (Req 22.6, 22.7, 22.8, 22.9, 22.10).
 *   - Rich props (chapters markers, ads config with `onSkip`/`onAdClick`/`onAdComplete`) are
 *     fed to the elements through the adapter's property setters (`chapters`, `ads`).
 *
 * Styling arrives from Core's Style_Auto_Injection (each element adopts the Style_Layer on
 * connect); the consumer imports no CSS (Req 10.5). The former styled-components CSS is
 * ported to Core's `playerstack.css` (task 15.4) and the old styled subtree deleted (task
 * 15.2).
 */
const CoreAudioPlayerSkin = React.forwardRef((props, ref) => {
  const {
    videoRef,
    playerRef,
    loading,
    paused,
    ended,
    seeking,
    waiting,
    duration,
    buffered,
    bufferedRanges = [],
    currentTime,
    muted,
    volume,
    playbackRate,
    loop,
    poster,
    title,
    artist,
    chapters,
    onPlayClick,
    onPauseClick,
    changeVolume,
    onMutedClick,
    changeCurrentTime,
    changePlaybackRate,
    onPrevious,
    onNext,
    showNavButtons = false,
    ads = null,
    kernelMsg = null,
  } = props;

  const dispatch = useAppDispatch();
  const controllerRef = React.useRef(null);

  // Preserve the imperative surface the previous skin exposed to the wrapper
  // (`showControls`/`hideControls`). Auto-hide is now driven by Core's Style_Layer/state,
  // so these are safe no-ops that keep any existing optional-chained callers working
  // without changing behavior.
  React.useImperativeHandle(
    ref,
    () => ({
      showControls: () => {},
      hideControls: () => {},
    }),
    [],
  );

  // Publish the video/player refs to the skin's global UI context, exactly as the previous
  // `AudioPlayerSkin` did, so context consumers keep the same refs (Functional_Parity).
  React.useEffect(() => {
    dispatch({ videoRef, playerRef });
  }, [videoRef, playerRef, dispatch]);

  // Tag the controller host with `data-skin="audio"` so Core's ported audio CSS — keyed under
  // `:host([data-skin='audio'])` and the audio-specific `[part]` metadata (task 15.4) — actually
  // applies to this card/metadata/volume styling (Visual_Parity). `data-skin` is a plain HTML
  // attribute the host reflects; the React_Adapter treats undeclared props as JS PROPERTIES (not
  // attributes), so we set it imperatively on the host element via the ref to guarantee it lands
  // as `data-skin="audio"` on `playerstack-media-controller` where the `:host(...)` selector can
  // match it.
  React.useEffect(() => {
    const host = controllerRef.current;
    if (host) {
      host.setAttribute('data-skin', 'audio');
    }
  }, []);

  // Mirror the current React audio playback state into the Core store so every subscribed
  // UI_Element reflects it (interim bridge; see the hook's rationale). `buffered` is the
  // fractional loaded position; convert it to seconds for the store's `loaded` field.
  const loadedSeconds = React.useMemo(() => {
    if (bufferedRanges && bufferedRanges.length > 0) {
      return bufferedRanges[bufferedRanges.length - 1].end;
    }
    if (typeof buffered === 'number' && duration > 0) {
      return buffered * duration;
    }
    return 0;
  }, [bufferedRanges, buffered, duration]);

  useCoreMediaBridge({
    controllerRef,
    state: {
      currentTime,
      duration,
      loaded: loadedSeconds,
      bufferedRanges,
      paused,
      muted,
      volume,
      playbackRate,
      loop,
      ended,
      seeking,
      loading,
      buffering: waiting,
      kernelMsg,
    },
  });

  // --- Request handlers wired to the existing playback handlers (Functional_Parity) ---

  const handlePlayRequest = React.useCallback(() => onPlayClick?.(), [onPlayClick]);
  const handlePauseRequest = React.useCallback(() => onPauseClick?.(), [onPauseClick]);
  const handleSeekRequest = React.useCallback(
    (event) => {
      const time = event?.detail?.time;
      if (typeof time === 'number') {
        changeCurrentTime?.(time);
      }
    },
    [changeCurrentTime],
  );
  const handleVolumeRequest = React.useCallback(
    (event) => {
      const nextVolume = event?.detail?.volume;
      if (typeof nextVolume === 'number') {
        changeVolume?.(nextVolume);
      }
    },
    [changeVolume],
  );
  const handleMuteRequest = React.useCallback(() => onMutedClick?.(), [onMutedClick]);
  const handleUnmuteRequest = React.useCallback(() => onMutedClick?.(), [onMutedClick]);
  const handleRateRequest = React.useCallback(
    (event) => {
      const rate = event?.detail?.rate;
      if (typeof rate === 'number') {
        changePlaybackRate?.(rate);
      }
    },
    [changePlaybackRate],
  );

  // Prev/next navigation (Table 22-A, Req 22.9): the `playerstack-nav-buttons` element emits
  // `playerstack-prev-request`/`playerstack-next-request`, surfaced by the adapter as
  // `onPrevRequest`/`onNextRequest`. They are wired to the player's public `onPrevious`/`onNext`
  // callbacks, preserving their (no-arg) signatures.
  const handlePrevRequest = React.useCallback(() => onPrevious?.(), [onPrevious]);
  const handleNextRequest = React.useCallback(() => onNext?.(), [onNext]);

  // Ad callbacks preserved from the `ads` config so onSkip/onAdClick/onAdComplete fire
  // (Table 22-B, Req 22.8). `onAdComplete` is driven by the ad element's own completion
  // detection; here we forward the skip and click intents to the consumer's callbacks.
  const handleAdSkip = React.useCallback(() => ads?.onSkip?.(), [ads]);
  const handleAdClick = React.useCallback(() => ads?.onAdClick?.(), [ads]);

  const hasChapters = chapters && chapters.length > 0;

  return (
    <PlayerstackMediaController ref={controllerRef}>
      {/* Track metadata (Table 22-B): title + artist + poster rendered as audio-skin-specific
          presentational bits around the Core controls; CSS ports in task 15.4. */}
      {poster ? <img part="poster" src={poster} alt={title || ''} /> : null}
      <div part="metadata">
        {title ? <span part="title">{title}</span> : null}
        {artist ? <span part="artist">{artist}</span> : null}
      </div>

      {/* Ads overlay (Table 22-B): ads + skip-ad with preserved callbacks. */}
      {ads && <PlayerstackAdOverlay ads={ads} onAdSkip={handleAdSkip} onAdClick={handleAdClick} />}

      {/* Chapter markers/title (Table 22-A). */}
      {hasChapters && <PlayerstackChapters chapters={chapters} />}

      {/* Prev/next track navigation (Table 22-A), gated by the public `showNavButtons` prop. */}
      {showNavButtons && <PlayerstackNavButtons onPrevRequest={handlePrevRequest} onNextRequest={handleNextRequest} />}

      {/* Compact audio cluster (Table 22-A): play/pause + current-time/duration + seek. */}
      <PlayerstackAudioControls
        onPlayRequest={handlePlayRequest}
        onPauseRequest={handlePauseRequest}
        onSeekRequest={handleSeekRequest}
      />

      {/* Volume (Table 22-A): mute toggle + volume slider. */}
      <PlayerstackVolume
        onMuteRequest={handleMuteRequest}
        onUnmuteRequest={handleUnmuteRequest}
        onVolumeRequest={handleVolumeRequest}
      />

      {/* Settings — speed only (Table 22-B). */}
      <PlayerstackSettings onRateRequest={handleRateRequest} />
    </PlayerstackMediaController>
  );
});

CoreAudioPlayerSkin.displayName = 'CoreAudioPlayerSkin';

CoreAudioPlayerSkin.propTypes = {
  videoRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]).isRequired,
  playerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]).isRequired,
  hasResource: PropTypes.bool,
  loading: PropTypes.bool,
  paused: PropTypes.bool.isRequired,
  ended: PropTypes.bool.isRequired,
  seeking: PropTypes.bool,
  waiting: PropTypes.bool,
  duration: PropTypes.number.isRequired,
  buffered: PropTypes.number,
  bufferedRanges: PropTypes.arrayOf(
    PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }),
  ),
  currentTime: PropTypes.number.isRequired,
  muted: PropTypes.bool.isRequired,
  volume: PropTypes.number.isRequired,
  playbackRate: PropTypes.number,
  loop: PropTypes.bool,
  poster: PropTypes.string,
  title: PropTypes.string,
  artist: PropTypes.string,
  chapters: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      startTime: PropTypes.number.isRequired,
    }),
  ),
  onPlayClick: PropTypes.func.isRequired,
  onPauseClick: PropTypes.func.isRequired,
  onTogglePlay: PropTypes.func,
  changeVolume: PropTypes.func.isRequired,
  onMutedClick: PropTypes.func.isRequired,
  changeCurrentTime: PropTypes.func.isRequired,
  changePlaybackRate: PropTypes.func.isRequired,
  onSeeking: PropTypes.func,
  kernelMsg: PropTypes.any,
  onPrevious: PropTypes.func,
  onNext: PropTypes.func,
  showNavButtons: PropTypes.bool,
  ads: PropTypes.object,
};

export default CoreAudioPlayerSkin;
