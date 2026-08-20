import React from 'react';
import { render } from '@testing-library/react';

import {
  mutedIcon,
  unmutedIcon,
  skipBackIcon,
  skipForwardIcon,
  skipAdIcon,
  settingsIcon,
  arrowLeftIcon,
  arrowRightIcon,
  audioPlayIcon,
  audioPauseIcon,
  audioReplayIcon,
} from '@playerstack/core/icons';
import Icon from '@components/Icon';

// Icons are framework-agnostic descriptor objects rendered through the generic
// <Icon> component. These tests verify each descriptor renders a valid SVG.

describe('Icons — descriptor rendering', () => {
  const cases = [
    ['mutedIcon', mutedIcon],
    ['unmutedIcon', unmutedIcon],
    ['skipBackIcon', skipBackIcon],
    ['skipForwardIcon', skipForwardIcon],
    ['skipAdIcon', skipAdIcon],
    ['settingsIcon', settingsIcon],
    ['arrowLeftIcon', arrowLeftIcon],
    ['arrowRightIcon', arrowRightIcon],
    ['audioPlayIcon', audioPlayIcon],
    ['audioPauseIcon', audioPauseIcon],
    ['audioReplayIcon', audioReplayIcon],
  ];

  test.each(cases)('%s renders with default dimensions', (_name, icon) => {
    const { container } = render(<Icon icon={icon} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg.getAttribute('width')).toBe('36');
  });

  test.each(cases)('%s renders with custom dimensions', (_name, icon) => {
    const { container } = render(<Icon icon={icon} width={24} height={24} />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
  });
});
