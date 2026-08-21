import React from 'react';
import PropTypes from 'prop-types';

import CoreAudioPlayerSkin from '@AudioPlayer/CoreAudioPlayerSkin';

/**
 * `AudioPlayerSkin` is the public audio skin component. Since tasks 15.1/15.5 it renders the
 * UI by delegating to `CoreAudioPlayerSkin`, which composes Core's `playerstack-*` UI_Elements
 * (through the React_Adapter) inside a `playerstack-media-controller` — replacing the former
 * `styled-components` markup while preserving the public component contract (same props,
 * defaults, callbacks and `forwardRef`/`React.memo` surface), mirroring how `reactjs`'s
 * `PlayerSkin` delegates to `CorePlayerSkin`.
 *
 * The imperative surface (`showControls`/`hideControls`), the video/player ref publication to
 * the skin context, and every request→handler wiring live in `CoreAudioPlayerSkin`; this
 * component only forwards props and the ref so the exported contract is unchanged
 * (Functional_Parity).
 */
const AudioPlayerSkin = React.forwardRef((props, ref) => {
  return <CoreAudioPlayerSkin ref={ref} {...props} />;
});

AudioPlayerSkin.displayName = 'AudioPlayerSkin';

AudioPlayerSkin.propTypes = {
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
};

export default React.memo(
  AudioPlayerSkin,
  (p, n) =>
    p.videoRef === n.videoRef &&
    p.playerRef === n.playerRef &&
    p.hasResource === n.hasResource &&
    p.loading === n.loading &&
    p.paused === n.paused &&
    p.ended === n.ended &&
    p.seeking === n.seeking &&
    p.waiting === n.waiting &&
    p.duration === n.duration &&
    p.currentTime === n.currentTime &&
    p.buffered === n.buffered &&
    p.bufferedRanges === n.bufferedRanges &&
    p.muted === n.muted &&
    p.volume === n.volume &&
    p.playbackRate === n.playbackRate &&
    p.loop === n.loop &&
    p.poster === n.poster &&
    p.title === n.title &&
    p.artist === n.artist &&
    p.chapters === n.chapters &&
    p.kernelMsg === n.kernelMsg &&
    p.onPlayClick === n.onPlayClick &&
    p.onPauseClick === n.onPauseClick &&
    p.onTogglePlay === n.onTogglePlay &&
    p.changeVolume === n.changeVolume &&
    p.onMutedClick === n.onMutedClick &&
    p.changeCurrentTime === n.changeCurrentTime &&
    p.changePlaybackRate === n.changePlaybackRate &&
    p.onSeeking === n.onSeeking &&
    p.onPrevious === n.onPrevious &&
    p.onNext === n.onNext &&
    p.showNavButtons === n.showNavButtons &&
    p.ads === n.ads,
);
