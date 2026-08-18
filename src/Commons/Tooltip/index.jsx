import React from 'react';
import styled, { css } from 'styled-components';

import { useAppSelector } from '@context/index';

export const StyledTooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const fullscreenStyles = css`
  font-size: 130%;
  margin-bottom: 10px;
`;

const normalStyles = css`
  font-size: 90%;
  margin-bottom: 6px;
`;

const StyledTooltipText = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  background-color: rgba(15, 15, 15, 0.9);
  border-radius: 4px;
  padding: 5px 10px;
  white-space: nowrap;
  font-weight: 500;
  color: #fff;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 12;
  ${({ $fullscreen }) => ($fullscreen ? fullscreenStyles : normalStyles)}

  ${StyledTooltipWrapper}:hover & {
    opacity: 1;
  }

  &[data-suppressed='true'] {
    opacity: 0 !important;
  }

  ${StyledTooltipWrapper}:has([aria-expanded='true']) & {
    opacity: 0 !important;
  }
`;

/**
 * Tooltip wrapper shared between audio and video skins.
 *
 * Features:
 *  - Horizontal clamping within player container (playerRef from context)
 *  - Hides when any menu is open ([aria-expanded="true"] in player)
 *  - Hides on click
 *  - Fullscreen sizing
 *  - disabled prop to suppress tooltip entirely
 *
 * Usage:
 *   <Tooltip label="Mute (m)" fullscreen={false}>
 *     <button>...</button>
 *   </Tooltip>
 */
const Tooltip = ({ label, children, disabled = false, fullscreen = false, ...rest }) => {
  const state = useAppSelector();
  const tooltipRef = React.useRef(null);
  const wrapperRef = React.useRef(null);
  const [suppressed, setSuppressed] = React.useState(false);
  const [offsetX, setOffsetX] = React.useState(0);
  const rafRef = React.useRef(null);

  const handleMouseEnter = React.useCallback(() => {
    const playerElement = state.playerRef?.current;
    // Suppress if any menu is expanded
    if (playerElement && playerElement.querySelectorAll('[aria-expanded="true"]').length > 0) {
      setSuppressed(true);
      return;
    }
    setSuppressed(false);

    // Calculate clamping after paint so tooltip has dimensions
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const tooltipEl = tooltipRef.current;
      const wrapperEl = wrapperRef.current;
      if (!tooltipEl || !wrapperEl || !playerElement) {
        setOffsetX(0);
        return;
      }

      const tooltipRect = tooltipEl.getBoundingClientRect();
      const playerRect = playerElement.getBoundingClientRect();
      const padding = 8;

      if (tooltipRect.left < playerRect.left + padding) {
        setOffsetX(playerRect.left + padding - tooltipRect.left);
      } else if (tooltipRect.right > playerRect.right - padding) {
        setOffsetX(playerRect.right - padding - tooltipRect.right);
      } else {
        setOffsetX(0);
      }
    });
  }, [state.playerRef]);

  const handleMouseLeave = React.useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setSuppressed(false);
    setOffsetX(0);
  }, []);

  const handleClick = React.useCallback(() => {
    setSuppressed(true);
  }, []);

  if (!label || disabled) return children;

  return (
    <StyledTooltipWrapper
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...rest}
    >
      {children}
      <StyledTooltipText
        ref={tooltipRef}
        $fullscreen={fullscreen}
        data-suppressed={suppressed}
        style={{
          transform: `translateX(calc(-50% + ${offsetX}px))`,
        }}
      >
        {label}
      </StyledTooltipText>
    </StyledTooltipWrapper>
  );
};

Tooltip.displayName = 'Tooltip';

export default React.memo(Tooltip);
