import { css } from 'styled-components';

/**
 * Scoped CSS resets for player containers.
 * Applied inside both video and audio player wrappers to normalize
 * user-agent styles without leaking to the host application.
 *
 * Uses :where() to apply with zero specificity — any component-level
 * style will automatically win without needing !important or extra selectors.
 */
export const scopedResetStyles = css`
  &,
  :where(&) *,
  :where(&) *::before,
  :where(&) *::after {
    box-sizing: border-box;
  }

  :where(&) button {
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    padding: 0;
    margin: 0;
    cursor: pointer;
    outline: none;
  }

  :where(&) ul,
  :where(&) ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  :where(&) li {
    margin: 0;
    padding: 0;
  }

  :where(&) a {
    color: inherit;
    text-decoration: none;
  }
`;
