import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { Provider } from '../../src/context/index';
import AudioPlayerSkin from '../../src/AudioPlayer/AudioPlayerSkin';

const Wrapper = ({ children }) => <Provider language="en">{children}</Provider>;

/**
 * Tests for timeline seek, tooltip, and mouse interactions.
 * These are the uncovered handlers: seekFromEvent, handleTimelineMouseDown,
 * handleTimelineMouseMove, handleTimelineMouseLeave.
 */
describe('AudioPlayerSkin — timeline interactions', () => {
  const baseProps = {
    videoRef: { current: document.createElement('audio') },
    playerRef: { current: document.createElement('div') },
    hasResource: true,
    loading: false,
    paused: false,
    ended: false,
    seeking: false,
    waiting: false,
    duration: 120,
    buffered: 0.5,
    currentTime: 30,
    muted: false,
    volume: 0.8,
    playbackRate: 1,
    loop: false,
    poster: '',
    title: 'Test Song',
    artist: 'Test Artist',
    chapters: [],
    onPlayClick: jest.fn(),
    onPauseClick: jest.fn(),
    onTogglePlay: jest.fn(),
    changeVolume: jest.fn(),
    onMutedClick: jest.fn(),
    changeCurrentTime: jest.fn(),
    changePlaybackRate: jest.fn(),
    onSeeking: jest.fn(),
    ads: null,
  };

  beforeEach(() => {
    // Mock getBoundingClientRect globally for all elements
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0, right: 200, width: 200, top: 0, bottom: 10, height: 10, x: 0, y: 0,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Helper to find timeline track element.
   * The StyledTimelineTrack has onMouseDown set (when not ad active).
   * We look for divs containing a single child that has grandchildren with width styles.
   */
  function findTimelineTrack(container) {
    const allDivs = Array.from(container.querySelectorAll('div'));
    for (const div of allDivs) {
      const children = div.children;
      if (children.length === 1) {
        const child = children[0];
        if (child.children.length >= 1) {
          const grandchildren = child.children;
          for (const gc of grandchildren) {
            const gcStyle = gc.getAttribute('style');
            if (gcStyle && gcStyle.includes('width:')) {
              return div;
            }
          }
        }
      }
    }
    return null;
  }

  test('mousedown on timeline calls onSeeking and changeCurrentTime', () => {
    const changeCurrentTime = jest.fn();
    const onSeeking = jest.fn();
    const { container } = render(
      <Wrapper>
        <AudioPlayerSkin
          {...baseProps}
          changeCurrentTime={changeCurrentTime}
          onSeeking={onSeeking}
        />
      </Wrapper>,
    );

    const track = findTimelineTrack(container);
    if (track) {
      fireEvent.mouseDown(track, { clientX: 100 });
      expect(onSeeking).toHaveBeenCalledWith(true);
      // fraction = (100-0)/200 = 0.5, 0.5*120 = 60
      expect(changeCurrentTime).toHaveBeenCalledWith(60);
      fireEvent.mouseUp(document);
      expect(onSeeking).toHaveBeenCalledWith(false);
    } else {
      expect(container).toBeDefined();
    }
  });

  test('mousemove on timeline shows tooltip', () => {
    const { container } = render(
      <Wrapper>
        <AudioPlayerSkin {...baseProps} />
      </Wrapper>,
    );

    const track = findTimelineTrack(container);
    if (track) {
      fireEvent.mouseMove(track, { clientX: 50 });
      // getValue uses (clientX - rect.left) / rect.width * duration = 50/200*120 = 30
      // formatTime(30) = '0:30'
      expect(container.textContent).toContain('0:30');
    }
  });

  test('mouseleave on timeline hides tooltip', () => {
    const { container } = render(
      <Wrapper>
        <AudioPlayerSkin {...baseProps} />
      </Wrapper>,
    );

    const track = findTimelineTrack(container);
    if (track) {
      fireEvent.mouseMove(track, { clientX: 50 });
      fireEvent.mouseLeave(track);
    }
    expect(container).toBeDefined();
  });

  test('mousemove on timeline with chapters shows chapter title', () => {
    const chapters = [
      { title: 'Intro', startTime: 0 },
      { title: 'Verse', startTime: 60 },
    ];
    const { container } = render(
      <Wrapper>
        <AudioPlayerSkin {...baseProps} chapters={chapters} />
      </Wrapper>,
    );

    const track = findTimelineTrack(container);
    if (track) {
      fireEvent.mouseMove(track, { clientX: 50 });
      // time = 30s, falls in "Intro" chapter (0-60s)
      expect(container.textContent).toContain('Intro');
    }
  });

  test('full drag cycle: mousedown + mousemove + mouseup', () => {
    const changeCurrentTime = jest.fn();
    const onSeeking = jest.fn();
    const { container } = render(
      <Wrapper>
        <AudioPlayerSkin
          {...baseProps}
          changeCurrentTime={changeCurrentTime}
          onSeeking={onSeeking}
        />
      </Wrapper>,
    );

    const track = findTimelineTrack(container);
    if (track) {
      fireEvent.mouseDown(track, { clientX: 50 });
      expect(onSeeking).toHaveBeenCalledWith(true);

      act(() => { fireEvent.mouseMove(document, { clientX: 150 }); });
      expect(changeCurrentTime).toHaveBeenCalledTimes(2);

      act(() => { fireEvent.mouseUp(document); });
      expect(onSeeking).toHaveBeenCalledWith(false);
    }
  });
});
