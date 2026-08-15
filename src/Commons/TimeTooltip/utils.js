import { getEventXCoordinate, getTimeFromSliderPosition } from '@playerstack/core';

export const getValue = (event, rect, duration) => {
  const clientX = getEventXCoordinate(event);
  return getTimeFromSliderPosition(clientX, rect, duration);
};
