import React from 'react';
import { renderHook } from '@testing-library/react';
import { useAds } from '@hooks/useAds';
import { webAdsPlatform } from '@utils/adsPlatform';

describe('useAds', () => {
  it('returns inactive when no ads configured', () => {
    const { result } = renderHook(() =>
      useAds({
        ads: null,
        currentTime: 0,
        duration: 100,
        paused: true,
        ended: false,
        onPauseClick: jest.fn(),
        platform: webAdsPlatform,
      }),
    );
    expect(result.current.isAdActive).toBe(false);
  });

  it('activates ad after first play', () => {
    const { result, rerender } = renderHook(
      ({ paused }) =>
        useAds({
          ads: { skipAfter: 5 },
          currentTime: 0,
          duration: 100,
          paused,
          ended: false,
          onPauseClick: jest.fn(),
          platform: webAdsPlatform,
        }),
      { initialProps: { paused: true } },
    );
    expect(result.current.isAdActive).toBe(false);

    rerender({ paused: false });
    expect(result.current.isAdActive).toBe(true);
  });

  it('computes skipCountdown correctly', () => {
    const { result } = renderHook(() =>
      useAds({
        ads: { skipAfter: 5 },
        currentTime: 2,
        duration: 100,
        paused: false,
        ended: false,
        onPauseClick: jest.fn(),
        platform: webAdsPlatform,
      }),
    );
    expect(result.current.skipCountdown).toBe(3);
    expect(result.current.canSkip).toBe(false);
  });
});
