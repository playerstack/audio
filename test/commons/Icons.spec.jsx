import React from 'react';
import { render } from '@testing-library/react';

import MutedIcon from '@Commons/Icons/MutedIcon';
import UnmutedIcon from '@Commons/Icons/UnmutedIcon';
import SkipBackIcon from '@Commons/Icons/SkipBackIcon';
import SkipForwardIcon from '@Commons/Icons/SkipForwardIcon';
import SkipAdIcon from '@Commons/Icons/SkipAdIcon';
import SetttingsIcon from '@Commons/Icons/SetttingsIcon';
import ArrowLeftIcon from '@Commons/Icons/ArrowLeftIcon';
import ArrowRightIcon from '@Commons/Icons/ArrowRightIcon';
import AudioPlayIcon from '@AudioPlayer/icons/AudioPlayIcon';
import AudioPauseIcon from '@AudioPlayer/icons/AudioPauseIcon';
import AudioReplayIcon from '@AudioPlayer/icons/AudioReplayIcon';

describe('Icons — branch coverage (default props)', () => {
  test('MutedIcon renders with default props', () => {
    const { container } = render(<MutedIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg.getAttribute('width')).toBe('36');
  });

  test('MutedIcon renders with custom props', () => {
    const { container } = render(<MutedIcon width={24} height={24} />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('24');
  });

  test('UnmutedIcon renders with default props', () => {
    const { container } = render(<UnmutedIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('UnmutedIcon renders with custom props', () => {
    const { container } = render(<UnmutedIcon width={20} height={20} />);
    expect(container.querySelector('svg').getAttribute('width')).toBe('20');
  });

  test('SkipBackIcon renders with default and custom props', () => {
    const { container: c1 } = render(<SkipBackIcon />);
    expect(c1.querySelector('svg')).toBeInTheDocument();
    const { container: c2 } = render(<SkipBackIcon width={24} height={24} />);
    expect(c2.querySelector('svg').getAttribute('width')).toBe('24');
  });

  test('SkipForwardIcon renders with default and custom props', () => {
    const { container: c1 } = render(<SkipForwardIcon />);
    expect(c1.querySelector('svg')).toBeInTheDocument();
    const { container: c2 } = render(<SkipForwardIcon width={24} height={24} />);
    expect(c2.querySelector('svg').getAttribute('width')).toBe('24');
  });

  test('SkipAdIcon renders with default and custom props', () => {
    const { container: c1 } = render(<SkipAdIcon />);
    expect(c1.querySelector('svg')).toBeInTheDocument();
    const { container: c2 } = render(<SkipAdIcon width={20} height={20} />);
    expect(c2.querySelector('svg').getAttribute('width')).toBe('20');
  });

  test('SetttingsIcon renders with default and custom props', () => {
    const { container: c1 } = render(<SetttingsIcon />);
    expect(c1.querySelector('svg')).toBeInTheDocument();
    const { container: c2 } = render(<SetttingsIcon width={20} height={20} />);
    expect(c2.querySelector('svg').getAttribute('width')).toBe('20');
  });

  test('ArrowLeftIcon renders with default and custom props', () => {
    const { container: c1 } = render(<ArrowLeftIcon />);
    expect(c1.querySelector('svg')).toBeInTheDocument();
    const { container: c2 } = render(<ArrowLeftIcon width={16} height={16} />);
    expect(c2.querySelector('svg').getAttribute('width')).toBe('16');
  });

  test('ArrowRightIcon renders with default and custom props', () => {
    const { container: c1 } = render(<ArrowRightIcon />);
    expect(c1.querySelector('svg')).toBeInTheDocument();
    const { container: c2 } = render(<ArrowRightIcon width={16} height={16} />);
    expect(c2.querySelector('svg').getAttribute('width')).toBe('16');
  });

  test('AudioPlayIcon renders with default and custom props', () => {
    const { container: c1 } = render(<AudioPlayIcon />);
    expect(c1.querySelector('svg')).toBeInTheDocument();
    const { container: c2 } = render(<AudioPlayIcon width={20} height={20} />);
    expect(c2.querySelector('svg').getAttribute('width')).toBe('20');
  });

  test('AudioPauseIcon renders with default and custom props', () => {
    const { container: c1 } = render(<AudioPauseIcon />);
    expect(c1.querySelector('svg')).toBeInTheDocument();
    const { container: c2 } = render(<AudioPauseIcon width={20} height={20} />);
    expect(c2.querySelector('svg').getAttribute('width')).toBe('20');
  });

  test('AudioReplayIcon renders with default and custom props', () => {
    const { container: c1 } = render(<AudioReplayIcon />);
    expect(c1.querySelector('svg')).toBeInTheDocument();
    const { container: c2 } = render(<AudioReplayIcon width={20} height={20} />);
    expect(c2.querySelector('svg').getAttribute('width')).toBe('20');
  });
});
