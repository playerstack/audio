import styled from 'styled-components';
import { scopedReset } from '@Commons/scopedReset';

export const StyledAudioPlayerSkin = styled.div`
  ${scopedReset}
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #0f0f0f;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: visible;
  color: #eee;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

export const StyledAudioTooltip = styled.div`
  position: absolute;
  bottom: calc(100% - 16px);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  background: none;
  border: none;
  border-radius: 0;
  padding: 0;
  pointer-events: none;
  white-space: nowrap;
  z-index: 9999;
`;

export const StyledTooltipChapter = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
`;

export const StyledTooltipTime = styled.span`
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: #fff;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
`;

export const StyledControlsRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 0;
  position: relative;
`;

/* Skip buttons expand from 0 width when playing */
export const StyledSkipButtonWrapper = styled.div`
  overflow: hidden;
  max-width: ${({ $visible }) => ($visible ? '36px' : '0')};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition:
    max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s ease;
`;

/* Media label (paused): "Play: Title • Chapter" — same space as timeline */
export const StyledMediaLabelWrapper = styled.div`
  grid-area: 1 / 1;
  display: flex;
  align-items: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition: opacity 0.2s ease ${({ $visible }) => ($visible ? '0.3s' : '0s')};
  overflow: hidden;
  padding-left: 4px;
`;

export const StyledMediaLabel = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

export const StyledMediaLabelPrefix = styled.span`
  color: rgba(255, 255, 255, 0.6);
`;

/* Grid container to stack label and timeline in same space */
export const StyledContentArea = styled.div`
  flex: 1;
  min-width: 0;
  display: grid;
  align-items: center;
  margin-left: 6px;
`;

/* Timeline wrapper — expands when playing */
/* Timeline wrapper — reveals left to right when playing */
export const StyledTimelineWrapper = styled.div`
  grid-area: 1 / 1;
  min-width: 0;
  clip-path: ${({ $visible }) => ($visible ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)')};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition: clip-path 0.35s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const StyledPlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-width: 36px;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  & * {
    pointer-events: none;
  }
`;

export const StyledSkipButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-width: 36px;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  & * {
    pointer-events: none;
  }
`;

export const StyledTimelineContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  height: 28px;
  padding: 0 4px;
`;

export const StyledTimelineTrack = styled.div`
  position: relative;
  width: 100%;
  height: 18px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const StyledTimelineSegments = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: height 0.1s ease;

  ${StyledTimelineTrack}:hover & {
    height: 6px;
  }
`;

export const StyledTimelineBuffered = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
`;

export const StyledTimelineFilled = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #fff;
  border-radius: 4px;
`;

export const StyledChapterSegment = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  transition: transform 0.1s ease;
  transform-origin: center center;
  transform: ${({ $hovered }) => ($hovered ? 'scaleY(1.5)' : 'scaleY(1)')};
`;

export const StyledChapterFilled = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #fff;
`;

export const StyledChapterBuffered = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
`;

/* Single bar (no chapters) */
export const StyledSingleTrack = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

export const StyledLoadingStripes = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  background: repeating-linear-gradient(
    -60deg,
    transparent,
    transparent 3px,
    rgba(255, 255, 255, 0.15) 3px,
    rgba(255, 255, 255, 0.15) 6px
  );
  background-size: 200% 100%;
  animation: audioLoadingStripes 1.5s linear infinite;
  pointer-events: none;

  @keyframes audioLoadingStripes {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 24px 0;
    }
  }
`;

export const StyledTime = styled.span`
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  min-width: 48px;
  text-align: right;
  flex-shrink: 0;
  margin-right: 8px;
`;

export const StyledRightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
  margin-left: auto;
  margin-right: -4px;

  & > button {
    width: 28px;
    height: 28px;
  }
`;

export const StyledIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  & * {
    pointer-events: none;
  }
`;

export const StyledVolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
`;

export const StyledVolumeSliderWrapper = styled.div`
  overflow: hidden;
  max-width: ${({ $dragging }) => ($dragging ? '80px' : '0')};
  opacity: ${({ $dragging }) => ($dragging ? 1 : 0)};
  transition:
    max-width 0.25s ease,
    opacity 0.25s ease;
  display: flex;
  justify-content: flex-end;

  ${StyledVolumeContainer}:hover & {
    max-width: 80px;
    opacity: 1;
  }
`;

export const StyledVolumeTrack = styled.div`
  position: relative;
  width: 80px;
  height: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: auto;

  &::after {
    content: '';
    position: absolute;
    left: 6px;
    right: 6px;
    top: 50%;
    height: 4px;
    transform: translateY(-50%);
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const StyledVolumeFill = styled.div`
  position: absolute;
  top: 50%;
  right: 6px;
  height: 4px;
  transform: translateY(-50%);
  background: #fff;
  border-radius: 2px;
  pointer-events: none;
`;

export const StyledVolumeThumb = styled.div`
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transform: translate(50%, -50%);
  pointer-events: none;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
`;

export const StyledVolumeTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 6px;
  background: rgba(15, 15, 15, 0.9);
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
`;

export const StyledSettingsPanel = styled.div`
  position: absolute;
  bottom: 100%;
  right: 8px;
  margin-bottom: 8px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 160px;
  z-index: 10;
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
`;

export const StyledSettingsItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.08)' : 'transparent')};
  color: #eee;
  font-size: 13px;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const StyledSettingsLabel = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  padding: 4px 16px 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
