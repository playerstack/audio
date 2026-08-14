import { css } from 'styled-components';

/**
 * Minimal scoped reset applied inside player skin containers.
 * With Shadow DOM isolation, external styles don't leak in,
 * so this only handles base defaults and box-sizing.
 *
 * Usage:
 *   const StyledRoot = styled.div`${scopedReset}`;
 */
export const scopedReset = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;
