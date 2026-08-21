/**
 * Light-DOM styles for the audio player wrapper (task 15.2).
 *
 * WHY runtime injection instead of styled-components: task 15.2 removes
 * `styled-components` from the audio package. Core's `playerstack.css` is scoped to the
 * shadow roots of the `playerstack-*` Custom Elements (`:host`), so it CANNOT style the
 * audio-owned LIGHT-DOM wrapper `<div>` that positions the `playerstack-media-controller`.
 * These rules are ported 1:1 from the former `StyledAudioWrapper` (+ `scopedResetStyles`,
 * applied with `:where()` zero-specificity so component styles always win) so Visual_Parity
 * is preserved, mirroring how `reactjs`'s task 14.4 created `wrapperStyles.js`.
 *
 * The stylesheet is injected once into `document.head` under a stable id, exactly like
 * Core's Style_Auto_Injection philosophy but for the light DOM — the consumer imports no CSS.
 */

const STYLE_ELEMENT_ID = 'playerstack-audio-wrapper-styles';

/**
 * The wrapper CSS, ported from the removed `StyledAudioWrapper` styled-components rules.
 * `.playerstack-audio-wrapper` == former `StyledAudioWrapper` (+ `scopedResetStyles`).
 */
export const WRAPPER_CSS = `
.playerstack-audio-wrapper {
  position: relative;
  width: 100%;
  outline: none;
  overflow: visible;
}

.playerstack-audio-wrapper,
:where(.playerstack-audio-wrapper) *,
:where(.playerstack-audio-wrapper) *::before,
:where(.playerstack-audio-wrapper) *::after {
  box-sizing: border-box;
}

:where(.playerstack-audio-wrapper) button {
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  padding: 0;
  margin: 0;
  cursor: pointer;
  outline: none;
}

:where(.playerstack-audio-wrapper) ul,
:where(.playerstack-audio-wrapper) ol {
  list-style: none;
  margin: 0;
  padding: 0;
}

:where(.playerstack-audio-wrapper) li {
  margin: 0;
  padding: 0;
}

:where(.playerstack-audio-wrapper) a {
  color: inherit;
  text-decoration: none;
}
`;

/**
 * Inject the wrapper stylesheet into `document.head` exactly once. Idempotent:
 * repeated calls (multiple players on a page, re-mounts) are no-ops after the
 * first. Safe to call in SSR — it bails when `document` is unavailable.
 */
export function ensureAudioWrapperStyles() {
  if (typeof document === 'undefined') {
    return;
  }
  if (document.getElementById(STYLE_ELEMENT_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = WRAPPER_CSS;
  document.head.appendChild(style);
}
