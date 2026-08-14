/**
 * Shared utility for clamping tooltip position within a slider.
 * Extracted from DesktopPlayerSkin/components/TimeSlider/utils.js for reuse.
 */

export const getClampedPosition = ({ duration, currentTime, sliderWidth, elementWidth, offset = 0 }) => {
  if (duration <= 0 || sliderWidth <= 0 || elementWidth <= 0) {
    return 0;
  }
  const relativePosition = (currentTime / duration) * sliderWidth;

  const halfTooltipWidth = elementWidth / 2;
  const minPosition = halfTooltipWidth + offset;
  const maxPosition = sliderWidth - halfTooltipWidth - offset;

  const clampedPosition = Math.min(maxPosition, Math.max(minPosition, relativePosition));

  return clampedPosition;
};

export const getMouseTranslateX = ({ duration, currentTime, sliderWidth, tooltipWidth }) => {
  const clampedPosition = getClampedPosition({
    duration,
    currentTime,
    sliderWidth,
    elementWidth: tooltipWidth,
    offset: 5,
  });

  const translateX = ((clampedPosition / sliderWidth) * 100).toFixed(1);

  return translateX;
};

export const getValue = (event, rect, duration) => {
  const clientX =
    'changedTouches' in event && event.changedTouches?.length >= 1 ? event.changedTouches[0].pageX : event.clientX || 0;

  const w = clientX - rect.left;
  if (w <= 0) return 0;
  if (w >= rect.width) return duration;
  return Math.round((duration * w) / rect.width);
};
