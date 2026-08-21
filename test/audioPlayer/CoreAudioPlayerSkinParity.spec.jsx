import React from 'react';
import { render, act } from '@testing-library/react';

import AudioPlayerSkin from '@AudioPlayer/AudioPlayerSkin';
import { Provider } from '@context/index';
import { defaultProps } from '@AudioMediaPlayer/props.types';

/**
 * Task 15.6 — Parity tests for the migrated `audio` player.
 *
 * These tests validate the two parity axes of Req 20.7 / 22.1–22.5 / 22.11 for the audio
 * player that was migrated onto Core's UI_Elements (via the React_Adapter) in tasks
 * 15.1/15.5. The public skin (`AudioPlayerSkin`) delegates to `CoreAudioPlayerSkin`, which
 * composes the `playerstack-*` custom elements inside a `playerstack-media-controller`.
 *
 *  1. Visual_Parity (DOM structure):
 *     jsdom snapshots of the rendered audio player DOM tree (the composed `playerstack-*`
 *     custom elements + their `part`/`data-*` attributes) for representative states:
 *     default, playing, ads active, with chapters, with nav buttons, and with
 *     title/artist/poster.
 *
 *     IMPORTANT — jsdom cannot compute real layout or the CSS cascade (no box model, no
 *     `getComputedStyle` cascade from the Style_Layer, no media-query evaluation). Therefore
 *     TRUE pixel / computed-style Visual_Parity (Req 20.7: verified by snapshot/visual
 *     regression, NOT by property-based testing) is validated by a BROWSER visual-regression
 *     job in CI against the pre-migration reference — see the note below. The DOM-structure
 *     snapshots here are the AUTOMATED jsdom portion of that contract: they lock the element
 *     composition (custom-element tags, `part` metadata and `data-skin="audio"`) so a
 *     structural regression is caught in unit tests, while the pixel diff is owned by the
 *     browser VRT job.
 *
 *     ── BROWSER VISUAL-REGRESSION (manual/CI portion, NOT runnable in jsdom) ──
 *     The computed-style/pixel Visual_Parity for the ported audio CSS (the `:host([data-skin='audio'])`
 *     rules from task 15.4 — card/metadata/volume styling, and the default/playing/ads states)
 *     is verified by a browser-based visual-regression suite (e.g. Playwright/Percy) that
 *     renders the real audio player in a browser engine, applies the Style_Auto_Injection
 *     Style_Layer, and diffs screenshots against the golden pre-migration reference. That job
 *     lives in CI, not in this Jest (jsdom) suite, because jsdom does not implement layout or
 *     the CSS cascade.
 *
 *  2. Functional_Parity (behavior, jsdom):
 *     - Public props/defaults: the exported audio player's `defaultProps` still apply the same
 *       defaults (volume null, muted false, playbackRate 1, loop false, showNavButtons opt-in,
 *       ads null, chapters []).
 *     - Request-driven callbacks: dispatching each Core element's request event on the rendered
 *       custom elements fires the same public audio callback with the same signature —
 *       play/pause (onPlayClick/onPauseClick), seek (changeCurrentTime with detail.time), volume
 *       (changeVolume with detail.volume), mute/unmute (onMutedClick), rate (changePlaybackRate
 *       with detail.rate), prev/next (onPrevious/onNext), ad skip/click (ads.onSkip/ads.onAdClick).
 *     - `data-skin="audio"` is set on the `playerstack-media-controller` host (the Visual_Parity
 *       hook the ported audio CSS keys on).
 */

// The skin reads/writes the app UI context via `useAppDispatch`, so it must render inside the
// context Provider (mirrors how AudioMediaPlayerSkin wraps it in production).
const Wrapper = ({ children }) => <Provider language="en">{children}</Provider>;

// Minimal props required by CoreAudioPlayerSkin's bridge + render paths. `videoRef`/`playerRef`
// are required (published to the context on mount); the rest mirror the playback state the
// AudioMediaPlayerSkin feeds down. Callbacks are required by propTypes; default them to no-ops
// so individual tests only override the one under assertion.
const baseSkinProps = {
  videoRef: { current: null },
  playerRef: { current: null },
  hasResource: true,
  loading: false,
  paused: true,
  ended: false,
  seeking: false,
  waiting: false,
  duration: 180,
  buffered: 0,
  bufferedRanges: [],
  currentTime: 0,
  muted: false,
  volume: 0.8,
  playbackRate: 1,
  loop: false,
  poster: '',
  title: '',
  artist: '',
  chapters: [],
  kernelMsg: null,
  onPlayClick: () => {},
  onPauseClick: () => {},
  onTogglePlay: () => {},
  changeVolume: () => {},
  onMutedClick: () => {},
  changeCurrentTime: () => {},
  changePlaybackRate: () => {},
  onSeeking: () => {},
  onPrevious: () => {},
  onNext: () => {},
  showNavButtons: false,
  ads: null,
};

function renderSkin(extraProps = {}) {
  const ref = React.createRef();
  const utils = render(
    <Wrapper>
      <AudioPlayerSkin ref={ref} {...baseSkinProps} {...extraProps} />
    </Wrapper>,
  );
  // Access the rendered subtree via the forwarded ref pattern the kept audio tests use for the
  // exported skin: query custom elements from the render container.
  return { ...utils, ref };
}

// Dispatch a Core request event on a custom element the way the elements emit them
// (`bubbles: true, composed: true`), so the adapter's listener on the same element fires.
const dispatch = (el, eventName, detail) =>
  act(() => {
    el.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, composed: true }));
  });

// ─────────────────────────────────────────────────────────────────────────────
// 1. Visual_Parity — DOM-structure snapshots (automated jsdom portion of Req 20.7)
// ─────────────────────────────────────────────────────────────────────────────
describe('CoreAudioPlayerSkin — Visual_Parity DOM snapshots (Req 20.7, 22.2–22.5)', () => {
  // NOTE: these snapshots capture the LIGHT-DOM element composition (custom-element tags +
  // their `part`/`data-*` attributes) — NOT computed styles or layout, which jsdom cannot
  // produce. Pixel/computed-style parity is covered by the browser visual-regression job
  // described in the file header.

  test('default state', () => {
    const { container } = renderSkin();
    expect(container.firstChild).toMatchSnapshot();
  });

  test('playing state (paused=false)', () => {
    const { container } = renderSkin({ paused: false, currentTime: 42 });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('ads active state', () => {
    const ads = {
      title: 'Ad',
      url: 'https://example.com',
      buttonText: 'Learn more',
      skipAfter: 5,
      onSkip: () => {},
      onAdClick: () => {},
    };
    const { container } = renderSkin({ ads });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('with chapters', () => {
    const chapters = [
      { title: 'Intro', startTime: 0 },
      { title: 'Verse', startTime: 30 },
      { title: 'Chorus', startTime: 90 },
    ];
    const { container } = renderSkin({ chapters });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('with nav buttons', () => {
    const { container } = renderSkin({ showNavButtons: true });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('with title/artist/poster metadata', () => {
    const { container } = renderSkin({
      title: 'Song Title',
      artist: 'The Artist',
      poster: 'https://example.com/cover.jpg',
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2a. Functional_Parity — public props / defaults (Req 22.1, 22.11)
// ─────────────────────────────────────────────────────────────────────────────
describe('Functional_Parity — public props & defaults (Req 22.1, 22.11)', () => {
  test('exported audio player defaultProps preserve the pre-migration defaults', () => {
    // These are the public defaults consumers rely on; parity means the migration to Core
    // UI_Elements did not change them. Read straight from the AudioMediaPlayer factory
    // props.types defaultProps.
    expect(defaultProps.url).toBe('');
    expect(defaultProps.playing).toBe(false);
    expect(defaultProps.loop).toBe(false);
    expect(defaultProps.volume).toBeNull();
    expect(defaultProps.muted).toBe(false);
    expect(defaultProps.playbackRate).toBe(1);
    expect(defaultProps.width).toBe('100%');
    expect(defaultProps.playsinline).toBe(false);
    expect(defaultProps.stopOnUnmount).toBe(true);
    expect(defaultProps.waiting).toBe(false);
    expect(defaultProps.language).toBe('en');
    expect(defaultProps.title).toBe('');
    expect(defaultProps.artist).toBe('');
    expect(defaultProps.poster).toBe('');
    expect(defaultProps.chapters).toEqual([]);
    expect(defaultProps.ads).toBeNull();
    // showNavButtons has no default → opt-in (falsy) just like reactjs.
    expect(defaultProps.showNavButtons).toBeUndefined();
  });

  test('CoreAudioPlayerSkin applies its own opt-in default: showNavButtons=false hides the nav cluster', () => {
    const { container } = renderSkin();
    // With no showNavButtons prop, the default (false) means no nav-buttons element renders.
    expect(container.querySelector('playerstack-nav-buttons')).toBeNull();
  });

  test('the media-controller host carries data-skin="audio" (Visual_Parity hook for ported CSS)', () => {
    const { container } = renderSkin();
    const host = container.querySelector('playerstack-media-controller');
    expect(host).not.toBeNull();
    expect(host.getAttribute('data-skin')).toBe('audio');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2b. Functional_Parity — request-driven public callbacks (Req 22.1, 22.6–22.9)
// ─────────────────────────────────────────────────────────────────────────────
describe('Functional_Parity — request-driven callbacks (Req 22.1, 22.6, 22.7, 22.8, 22.9)', () => {
  test('play-request fires onPlayClick (no args)', () => {
    const onPlayClick = jest.fn();
    const { container } = renderSkin({ onPlayClick });
    dispatch(container.querySelector('playerstack-audio-controls'), 'playerstack-play-request');
    expect(onPlayClick).toHaveBeenCalledTimes(1);
    expect(onPlayClick).toHaveBeenCalledWith();
  });

  test('pause-request fires onPauseClick (no args)', () => {
    const onPauseClick = jest.fn();
    const { container } = renderSkin({ onPauseClick });
    dispatch(container.querySelector('playerstack-audio-controls'), 'playerstack-pause-request');
    expect(onPauseClick).toHaveBeenCalledTimes(1);
    expect(onPauseClick).toHaveBeenCalledWith();
  });

  test('seek-request fires changeCurrentTime with detail.time', () => {
    const changeCurrentTime = jest.fn();
    const { container } = renderSkin({ changeCurrentTime });
    dispatch(container.querySelector('playerstack-audio-controls'), 'playerstack-seek-request', { time: 73 });
    expect(changeCurrentTime).toHaveBeenCalledWith(73);
  });

  test('volume-request fires changeVolume with detail.volume', () => {
    const changeVolume = jest.fn();
    const { container } = renderSkin({ changeVolume });
    dispatch(container.querySelector('playerstack-volume'), 'playerstack-volume-request', { volume: 0.25 });
    expect(changeVolume).toHaveBeenCalledWith(0.25);
  });

  test('mute-request and unmute-request both fire onMutedClick', () => {
    const onMutedClick = jest.fn();
    const { container } = renderSkin({ onMutedClick });
    const volume = container.querySelector('playerstack-volume');
    dispatch(volume, 'playerstack-mute-request');
    dispatch(volume, 'playerstack-unmute-request');
    expect(onMutedClick).toHaveBeenCalledTimes(2);
  });

  test('rate-request fires changePlaybackRate with detail.rate', () => {
    const changePlaybackRate = jest.fn();
    const { container } = renderSkin({ changePlaybackRate });
    dispatch(container.querySelector('playerstack-settings'), 'playerstack-rate-request', { rate: 1.5 });
    expect(changePlaybackRate).toHaveBeenCalledWith(1.5);
  });

  test('prev/next requests fire onPrevious/onNext (no args)', () => {
    const onPrevious = jest.fn();
    const onNext = jest.fn();
    const { container } = renderSkin({ showNavButtons: true, onPrevious, onNext });
    const nav = container.querySelector('playerstack-nav-buttons');
    expect(nav).not.toBeNull();
    dispatch(nav, 'playerstack-prev-request');
    dispatch(nav, 'playerstack-next-request');
    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  test('ad skip/click requests fire ads.onSkip/ads.onAdClick', () => {
    const onSkip = jest.fn();
    const onAdClick = jest.fn();
    const ads = { title: 'Ad', url: 'https://x', buttonText: 'Go', skipAfter: 5, onSkip, onAdClick };
    const { container } = renderSkin({ ads });
    const overlay = container.querySelector('playerstack-ad-overlay');
    expect(overlay).not.toBeNull();
    dispatch(overlay, 'playerstack-ad-skip');
    dispatch(overlay, 'playerstack-ad-click');
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onAdClick).toHaveBeenCalledTimes(1);
  });
});
