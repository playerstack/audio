import React from 'react';
import PropTypes from 'prop-types';
import { formatTime, isMobile } from '@playerstack/core';

import {
  audioPlayIcon,
  audioPauseIcon,
  audioReplayIcon,
  mutedIcon,
  unmutedIcon,
  skipBackIcon,
  skipForwardIcon,
  skipAdIcon,
} from '@playerstack/core/icons';
import Icon from '@components/Icon';
import AudioSettingsMenu from '@AudioPlayer/components/AudioSettingsMenu';
import Tooltip from '@Commons/Tooltip';
import { buildIconProps } from '@playerstack/core';
import { getValue } from '@Commons/TimeTooltip/utils';
import { useChapters } from '@hooks/useChapters';
import { useAds } from '@hooks/useAds';
import { webAdsPlatform } from '@utils/adsPlatform';
import { useAppDispatch, useAppSelector } from '@context/index';

import {
  StyledAudioPlayerSkin,
  StyledAudioTooltip,
  StyledTooltipChapter,
  StyledTooltipTime,
  StyledControlsRow,
  StyledSkipButtonWrapper,
  StyledMediaLabelWrapper,
  StyledMediaLabel,
  StyledMediaLabelPrefix,
  StyledContentArea,
  StyledTimelineWrapper,
  StyledPlayButton,
  StyledSkipButton,
  StyledTimelineContainer,
  StyledTimelineTrack,
  StyledTimelineSegments,
  StyledTimelineBuffered,
  StyledTimelineFilled,
  StyledChapterSegment,
  StyledChapterFilled,
  StyledChapterBuffered,
  StyledSingleTrack,
  StyledLoadingStripes,
  StyledTime,
  StyledRightControls,
  StyledIconButton,
  StyledVolumeContainer,
  StyledVolumeSliderWrapper,
  StyledVolumeTrack,
  StyledVolumeFill,
  StyledVolumeThumb,
  StyledVolumeTooltip,
} from '@AudioPlayer/AudioPlayerSkin.styled';

const AudioPlayerSkin = React.forwardRef(
  (
    {
      videoRef,
      playerRef,
      hasResource = false,
      loading,
      paused,
      ended,
      seeking,
      waiting,
      duration,
      buffered = null,
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
      onTogglePlay,
      changeVolume,
      onMutedClick,
      changeCurrentTime,
      changePlaybackRate,
      onSeeking,
      onPrevious,
      onNext,
      showNavButtons,
      ads = null,
      kernelMsg = null,
    },
    ref,
  ) => {
    const dispatch = useAppDispatch();
    const { i18n } = useAppSelector();
    const timelineRef = React.useRef(null);

    const { segments, getChapterAtTime } = useChapters({ chapters, duration });

    const { isAdActive, hasSkipTimer, canSkip, skipCountdown, onSkipClick } = useAds({
      ads,
      currentTime,
      duration,
      paused,
      ended,
      onPauseClick,
      platform: webAdsPlatform,
    });

    // Current chapter for paused view label
    const currentChapterTitle = React.useMemo(() => {
      const chapter = getChapterAtTime(currentTime);
      return chapter ? chapter.title : null;
    }, [getChapterAtTime, currentTime]);

    React.useEffect(() => {
      dispatch({ videoRef, playerRef });
    }, [videoRef, playerRef, dispatch]);

    React.useImperativeHandle(
      ref,
      () => ({
        showControls: () => {},
        hideControls: () => {},
      }),
      [],
    );

    // Timeline seek logic — unified for mouse and touch
    const seekFromPosition = React.useCallback(
      (clientX) => {
        if (!timelineRef.current || !duration) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        changeCurrentTime(fraction * duration);
      },
      [duration, changeCurrentTime],
    );

    const seekFromEvent = React.useCallback(
      (e) => {
        const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        seekFromPosition(clientX);
      },
      [seekFromPosition],
    );

    const handleTimelineMouseDown = React.useCallback(
      (e) => {
        if (!duration) return;
        onSeeking?.(true);
        seekFromEvent(e);

        const handleMove = (moveEvent) => seekFromEvent(moveEvent);
        const handleUp = () => {
          onSeeking?.(false);
          document.removeEventListener('mousemove', handleMove);
          document.removeEventListener('mouseup', handleUp);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
      },
      [duration, seekFromEvent, onSeeking],
    );

    const handleTimelineTouchStart = React.useCallback(
      (e) => {
        if (!duration) return;
        e.preventDefault();
        onSeeking?.(true);
        seekFromPosition(e.touches[0].clientX);

        const handleTouchMove = (moveEvent) => {
          moveEvent.preventDefault();
          if (moveEvent.touches[0]) {
            seekFromPosition(moveEvent.touches[0].clientX);
          }
        };
        const handleTouchEnd = () => {
          onSeeking?.(false);
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        };

        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
      },
      [duration, seekFromPosition, onSeeking],
    );

    // Timeline tooltip on hover
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [tooltipTime, setTooltipTime] = React.useState(0);
    const [tooltipChapter, setTooltipChapter] = React.useState(null);
    const [tooltipLeft, setTooltipLeft] = React.useState(0);
    const skinRef = React.useRef(null);
    const tooltipRef = React.useRef(null);

    const handleTimelineMouseMove = React.useCallback(
      (e) => {
        if (!timelineRef.current || !duration) return;
        const timelineRect = timelineRef.current.getBoundingClientRect();
        const time = getValue(e, timelineRect, duration);

        // Calculate tooltip left clamped within timeline bounds (relative to skin)
        const skinEl = skinRef.current;
        const skinRect = skinEl ? skinEl.getBoundingClientRect() : timelineRect;
        const tooltipWidth = tooltipRef.current?.offsetWidth || 0;
        const halfTooltip = tooltipWidth / 2;

        // Mouse position relative to skin
        const mouseInSkin = e.clientX - skinRect.left;
        // Timeline edges relative to skin
        const timelineLeftInSkin = timelineRect.left - skinRect.left;
        const timelineRightInSkin = timelineRect.right - skinRect.left;

        // Clamp so tooltip doesn't overflow timeline boundaries
        const minLeft = timelineLeftInSkin + halfTooltip;
        const maxLeft = timelineRightInSkin - halfTooltip;
        const clampedLeft = Math.max(minLeft, Math.min(maxLeft, mouseInSkin));

        setTooltipTime(time);
        setTooltipLeft(clampedLeft);
        setShowTooltip(true);
        const chapter = getChapterAtTime(time);
        setTooltipChapter(chapter ? chapter.title : null);
      },
      [duration, getChapterAtTime],
    );

    const handleTimelineMouseLeave = React.useCallback(() => {
      setShowTooltip(false);
    }, []);

    // Determine which chapter segment is being hovered
    const hoveredSegmentIndex = React.useMemo(() => {
      if (!showTooltip || segments.length === 0) return -1;
      const chapter = getChapterAtTime(tooltipTime);
      if (!chapter) return -1;
      return segments.findIndex((s) => s.startTime === chapter.startTime);
    }, [showTooltip, tooltipTime, segments, getChapterAtTime]);

    // Skip ±10s
    const handleSkipBack = React.useCallback(() => {
      if (!duration) return;
      const newTime = Math.max(0, currentTime - 10);
      changeCurrentTime(newTime);
    }, [currentTime, duration, changeCurrentTime]);

    const handleSkipForward = React.useCallback(() => {
      if (!duration) return;
      const newTime = Math.min(duration, currentTime + 10);
      changeCurrentTime(newTime);
    }, [currentTime, duration, changeCurrentTime]);

    // Volume drag on custom track (desktop only — touch devices use hardware volume)
    const volumeTrackRef = React.useRef(null);
    const volumeContainerRef = React.useRef(null);
    const [volumeHovering, setVolumeHovering] = React.useState(false);
    const [volumeTooltipLeft, setVolumeTooltipLeft] = React.useState(null);

    // On mobile, the volume slider is not rendered — user controls volume via
    // hardware buttons. Only the mute/unmute toggle icon is shown.
    const showVolumeSlider = !isMobile;

    const updateTooltipPosition = React.useCallback((clientX) => {
      const container = volumeContainerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const left = Math.max(0, Math.min(containerRect.width, clientX - containerRect.left));
      setVolumeTooltipLeft(left);
    }, []);

    const setVolumeFromPosition = React.useCallback(
      (clientX) => {
        const track = volumeTrackRef.current;
        if (!track) return;
        const rect = track.getBoundingClientRect();
        const usableWidth = rect.width - 12;
        const offsetX = clientX - rect.left - 6;
        const fraction = Math.max(0, Math.min(1, 1 - offsetX / usableWidth));
        changeVolume(fraction);
      },
      [changeVolume],
    );

    const setVolumeFromEvent = React.useCallback(
      (e) => {
        const track = e.currentTarget || volumeTrackRef.current;
        if (!track) return;
        volumeTrackRef.current = track;
        const rect = track.getBoundingClientRect();
        const usableWidth = rect.width - 12;
        const offsetX = e.clientX - rect.left - 6;
        const fraction = Math.max(0, Math.min(1, 1 - offsetX / usableWidth));
        changeVolume(fraction);
      },
      [changeVolume],
    );

    const [volumeDragging, setVolumeDragging] = React.useState(false);

    const handleVolumeMouseDown = React.useCallback(
      (e) => {
        volumeTrackRef.current = e.currentTarget;
        setVolumeFromEvent(e);
        setVolumeDragging(true);
        updateTooltipPosition(e.clientX);

        const handleMove = (moveEvent) => {
          setVolumeFromPosition(moveEvent.clientX);
          updateTooltipPosition(moveEvent.clientX);
        };
        const handleUp = () => {
          setVolumeDragging(false);
          document.removeEventListener('mousemove', handleMove);
          document.removeEventListener('mouseup', handleUp);
        };
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
      },
      [setVolumeFromEvent, setVolumeFromPosition, updateTooltipPosition],
    );

    const handleVolumeTouchStart = React.useCallback(
      (e) => {
        e.preventDefault();
        volumeTrackRef.current = e.currentTarget;
        const clientX = e.touches[0].clientX;
        setVolumeFromPosition(clientX);
        setVolumeDragging(true);
        updateTooltipPosition(clientX);

        const handleTouchMove = (moveEvent) => {
          moveEvent.preventDefault();
          if (moveEvent.touches[0]) {
            setVolumeFromPosition(moveEvent.touches[0].clientX);
            updateTooltipPosition(moveEvent.touches[0].clientX);
          }
        };
        const handleTouchEnd = () => {
          setVolumeDragging(false);
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        };
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
      },
      [setVolumeFromPosition, updateTooltipPosition],
    );

    const handleVolumeSliderEnter = React.useCallback(() => {
      setVolumeHovering(true);
    }, []);

    const handleVolumeSliderLeave = React.useCallback(() => {
      if (!volumeDragging) {
        setVolumeHovering(false);
      }
    }, [volumeDragging]);

    // Hide tooltip when drag ends and cursor left the slider
    React.useEffect(() => {
      if (!volumeDragging) {
        setVolumeHovering(false);
      }
    }, [volumeDragging]);

    const isPlaying = !paused && !ended;
    const iconProps = buildIconProps();
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedProgress = buffered != null ? buffered * 100 : 0;
    const remainingTime = duration > 0 ? Math.max(0, duration - currentTime) : 0;
    const timeDisplay = duration > 0 && remainingTime > 0 ? `-${formatTime(remainingTime)}` : '0:00';

    return (
      <StyledAudioPlayerSkin ref={skinRef}>
        {showTooltip && (
          <StyledAudioTooltip ref={tooltipRef} style={{ left: `${tooltipLeft}px` }}>
            {tooltipChapter && <StyledTooltipChapter>{tooltipChapter}</StyledTooltipChapter>}
            <StyledTooltipTime>{formatTime(tooltipTime)}</StyledTooltipTime>
          </StyledAudioTooltip>
        )}
        <StyledControlsRow>
          {/* Skip back — hidden during ads */}
          {!isAdActive && (
            <Tooltip label={i18n.skipBack}>
              <StyledSkipButtonWrapper $visible={isPlaying}>
                <StyledSkipButton onClick={handleSkipBack} aria-label={i18n.skipBack}>
                  <Icon icon={skipBackIcon} {...iconProps} />
                </StyledSkipButton>
              </StyledSkipButtonWrapper>
            </Tooltip>
          )}

          {/* Play/Pause button OR Skip Ad button */}
          {isAdActive && hasSkipTimer ? (
            <StyledSkipButtonWrapper $visible={true}>
              <StyledPlayButton
                onClick={canSkip ? onSkipClick : undefined}
                aria-label={canSkip ? i18n.skipAd : `${skipCountdown}s`}
                style={{ opacity: canSkip ? 1 : 0.6, cursor: canSkip ? 'pointer' : 'default' }}
              >
                {canSkip ? (
                  <Icon icon={skipAdIcon} width={24} height={24} />
                ) : (
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{skipCountdown}s</span>
                )}
              </StyledPlayButton>
            </StyledSkipButtonWrapper>
          ) : (
            <Tooltip label={ended ? i18n.replay : paused ? i18n.play : i18n.pause}>
              <StyledPlayButton
                onClick={paused || ended ? onPlayClick : onPauseClick}
                aria-label={ended ? i18n.replay : paused ? i18n.play : i18n.pause}
              >
                {ended ? (
                  <Icon icon={audioReplayIcon} {...iconProps} />
                ) : paused ? (
                  <Icon icon={audioPlayIcon} {...iconProps} />
                ) : (
                  <Icon icon={audioPauseIcon} {...iconProps} />
                )}
              </StyledPlayButton>
            </Tooltip>
          )}

          {/* Skip forward — hidden during ads */}
          {!isAdActive && (
            <Tooltip label={i18n.skipForward}>
              <StyledSkipButtonWrapper $visible={isPlaying}>
                <StyledSkipButton onClick={handleSkipForward} aria-label={i18n.skipForward}>
                  <Icon icon={skipForwardIcon} {...iconProps} />
                </StyledSkipButton>
              </StyledSkipButtonWrapper>
            </Tooltip>
          )}

          {/* Content area: label (paused) and timeline (playing) stacked */}
          <StyledContentArea>
            <StyledMediaLabelWrapper $visible={!isPlaying}>
              <StyledMediaLabel>
                <StyledMediaLabelPrefix>{ended ? 'Replay: ' : 'Play: '}</StyledMediaLabelPrefix>
                {title || ''}
                {currentChapterTitle && ` • ${currentChapterTitle}`}
              </StyledMediaLabel>
            </StyledMediaLabelWrapper>

            <StyledTimelineWrapper $visible={isPlaying}>
              <StyledTimelineContainer>
                <StyledTimelineTrack
                  ref={timelineRef}
                  onMouseDown={isAdActive ? undefined : handleTimelineMouseDown}
                  onTouchStart={isAdActive ? undefined : handleTimelineTouchStart}
                  onMouseMove={isAdActive ? undefined : handleTimelineMouseMove}
                  onMouseLeave={isAdActive ? undefined : handleTimelineMouseLeave}
                  style={isAdActive ? { pointerEvents: 'none', cursor: 'default' } : undefined}
                >
                  <StyledTimelineSegments>
                    {segments.length > 0 ? (
                      segments.map((seg, index) => {
                        const segDuration = seg.endTime - seg.startTime;
                        const widthPercent = (segDuration / duration) * 100;

                        let fillPercent = 0;
                        if (currentTime >= seg.endTime) {
                          fillPercent = 100;
                        } else if (currentTime > seg.startTime) {
                          fillPercent = ((currentTime - seg.startTime) / segDuration) * 100;
                        }

                        // Multi-range buffer: compute buffered portions within this segment
                        const segmentBufferRanges =
                          bufferedRanges.length > 0
                            ? bufferedRanges
                                .map((range) => {
                                  const overlapStart = Math.max(range.start, seg.startTime);
                                  const overlapEnd = Math.min(range.end, seg.endTime);
                                  if (overlapStart >= overlapEnd) return null;
                                  return {
                                    leftPct: ((overlapStart - seg.startTime) / segDuration) * 100,
                                    widthPct: ((overlapEnd - overlapStart) / segDuration) * 100,
                                  };
                                })
                                .filter(Boolean)
                            : [];

                        const maxBufferedPct =
                          segmentBufferRanges.length > 0
                            ? Math.max(...segmentBufferRanges.map((r) => r.leftPct + r.widthPct))
                            : 0;

                        return (
                          <StyledChapterSegment
                            key={seg.startTime}
                            style={{ width: `${widthPercent}%` }}
                            $hovered={hoveredSegmentIndex === index}
                          >
                            {segmentBufferRanges.map((r, i) => (
                              <StyledChapterBuffered
                                key={i}
                                style={{ position: 'absolute', left: `${r.leftPct}%`, width: `${r.widthPct}%` }}
                              />
                            ))}
                            <StyledChapterFilled
                              style={{ width: `${fillPercent}%`, background: isAdActive ? '#fc0' : undefined }}
                            />
                            {waiting && maxBufferedPct < 100 && (
                              <StyledLoadingStripes
                                style={{ clipPath: `inset(0 0 0 ${Math.max(maxBufferedPct, fillPercent)}%)` }}
                              />
                            )}
                          </StyledChapterSegment>
                        );
                      })
                    ) : (
                      <StyledSingleTrack>
                        {bufferedRanges.length > 0 && duration > 0 ? (
                          bufferedRanges.map((range, i) => (
                            <StyledTimelineBuffered
                              key={i}
                              style={{
                                position: 'absolute',
                                left: `${(range.start / duration) * 100}%`,
                                width: `${((range.end - range.start) / duration) * 100}%`,
                              }}
                            />
                          ))
                        ) : (
                          <StyledTimelineBuffered style={{ width: `${bufferedProgress}%` }} />
                        )}
                        <StyledTimelineFilled
                          style={{ width: `${progress}%`, background: isAdActive ? '#fc0' : undefined }}
                        />
                        {waiting && bufferedProgress < 100 && (
                          <StyledLoadingStripes
                            style={{ clipPath: `inset(0 0 0 ${Math.max(bufferedProgress, progress)}%)` }}
                          />
                        )}
                      </StyledSingleTrack>
                    )}
                  </StyledTimelineSegments>
                </StyledTimelineTrack>
              </StyledTimelineContainer>
            </StyledTimelineWrapper>
          </StyledContentArea>

          <StyledTime>{timeDisplay}</StyledTime>

          <StyledRightControls>
            <StyledVolumeContainer ref={volumeContainerRef}>
              {showVolumeSlider && (
                <StyledVolumeSliderWrapper
                  $dragging={volumeDragging}
                  onMouseEnter={handleVolumeSliderEnter}
                  onMouseLeave={handleVolumeSliderLeave}
                >
                  <StyledVolumeTrack
                    onMouseDown={handleVolumeMouseDown}
                    onTouchStart={handleVolumeTouchStart}
                    role="slider"
                    aria-label="Volume"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={muted ? 0 : Math.round(volume * 100)}
                  >
                    <StyledVolumeFill style={{ width: `${muted ? 0 : volume * 68}px` }} />
                    <StyledVolumeThumb style={{ right: `${6 + (muted ? 0 : volume * 68)}px` }} />
                  </StyledVolumeTrack>
                </StyledVolumeSliderWrapper>
              )}
              {showVolumeSlider && (volumeHovering || volumeDragging) && (
                <StyledVolumeTooltip
                  style={
                    volumeTooltipLeft != null && volumeDragging
                      ? { left: `${volumeTooltipLeft}px`, transform: 'translateX(-50%)' }
                      : { left: `${6 + 68 * (1 - (muted ? 0 : volume))}px`, transform: 'translateX(-50%)' }
                  }
                >
                  {muted ? 0 : Math.round(volume * 100)}%
                </StyledVolumeTooltip>
              )}
              <Tooltip label={muted ? i18n.unmute : i18n.mute} disabled={volumeDragging}>
                <StyledIconButton onClick={onMutedClick} aria-label={muted ? i18n.unmute : i18n.mute}>
                  {muted || volume === 0 ? (
                    <Icon icon={mutedIcon} {...iconProps} />
                  ) : (
                    <Icon icon={unmutedIcon} {...iconProps} />
                  )}
                </StyledIconButton>
              </Tooltip>
            </StyledVolumeContainer>

            {!isAdActive && <AudioSettingsMenu playbackRate={playbackRate} changePlaybackRate={changePlaybackRate} />}
          </StyledRightControls>
        </StyledControlsRow>
      </StyledAudioPlayerSkin>
    );
  },
);

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
