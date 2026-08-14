import PropTypes from 'prop-types';
import { en, es } from '@playerstack/core';

const i18n = { en, es };
const { string, bool, number, oneOfType, shape, object, func, node } = PropTypes;

const availableLanguages = Object.keys(i18n);

/**
 * Ads overlay configuration shape.
 */
const adsPropType = PropTypes.shape({
  title: string.isRequired,
  url: string.isRequired,
  buttonText: string.isRequired,
  icon: string,
  skipAfter: number,
  onSkip: func,
  onAdClick: func,
  onAdComplete: func,
});

export const propTypes = {
  url: string,
  playing: bool,
  loop: bool,
  volume: number,
  muted: bool,
  playbackRate: number,
  width: oneOfType([string, number]),
  progressInterval: number,
  playsinline: bool,
  language: PropTypes.oneOf(availableLanguages),
  stopOnUnmount: bool,
  fallback: node,
  waiting: bool,
  wrapper: oneOfType([string, func, shape({ render: func.isRequired })]),
  config: shape({
    forceHLS: bool,
    forceSafariHLS: bool,
    forceDisableHls: bool,
    forceDASH: bool,
    forceFLV: bool,
    hlsOptions: object,
    hlsVersion: string,
    dashVersion: string,
    flvVersion: string,
  }),
  title: string,
  artist: string,
  poster: string,
  chapters: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      startTime: PropTypes.number.isRequired,
    }),
  ),
  ads: adsPropType,
  onReady: func,
  onStart: func,
  onPlay: func,
  onPause: func,
  onBuffer: func,
  onBufferEnd: func,
  onEnded: func,
  onError: func,
  onDuration: func,
  onSeek: func,
  onPlayBackRateChange: func,
  onProgress: func,
  onLoaded: func,
  onMount: func,
  onPrevious: func,
  onNext: func,
  showNavButtons: bool,
};

const noop = () => {};

export const defaultProps = {
  url: '',
  playing: false,
  loop: false,
  volume: null,
  muted: false,
  playbackRate: 1,
  width: '100%',
  progressInterval: 1000,
  playsinline: false,
  stopOnUnmount: true,
  fallback: null,
  waiting: false,
  wrapper: 'div',
  language: availableLanguages[0],
  title: '',
  artist: '',
  poster: '',
  chapters: [],
  ads: null,
  config: {
    forceHLS: false,
    forceDASH: false,
    forceFLV: false,
    hlsOptions: {},
    hlsVersion: '1.5.7',
    dashVersion: '4.7.4',
    flvVersion: '1.6.2',
    forceDisableHls: false,
  },
  onReady: noop,
  onStart: noop,
  onPlay: noop,
  onPause: noop,
  onBuffer: noop,
  onBufferEnd: noop,
  onEnded: noop,
  onError: noop,
  onDuration: noop,
  onSeek: noop,
  onPlayBackRateChange: noop,
  onProgress: noop,
  onLoaded: noop,
  onMount: noop,
};
