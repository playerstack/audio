import React from 'react';
import { renderHook } from '@testing-library/react';

import { useChapters } from '@hooks/useChapters';

describe('useChapters', () => {
  it('returns empty segments when no chapters', () => {
    const { result } = renderHook(() => useChapters({ chapters: [], duration: 100 }));
    expect(result.current.segments).toEqual([]);
  });

  it('returns empty segments when duration is 0', () => {
    const chapters = [{ title: 'Intro', startTime: 0 }];
    const { result } = renderHook(() => useChapters({ chapters, duration: 0 }));
    expect(result.current.segments).toEqual([]);
  });

  it('computes segments correctly', () => {
    const chapters = [
      { title: 'Intro', startTime: 0 },
      { title: 'Main', startTime: 30 },
      { title: 'Outro', startTime: 90 },
    ];
    const { result } = renderHook(() => useChapters({ chapters, duration: 120 }));
    expect(result.current.segments).toHaveLength(3);
    expect(result.current.segments[0].title).toBe('Intro');
    expect(result.current.segments[0].endTime).toBe(30);
    expect(result.current.segments[2].endTime).toBe(120);
  });

  it('getChapterAtTime finds correct chapter', () => {
    const chapters = [
      { title: 'Intro', startTime: 0 },
      { title: 'Main', startTime: 30 },
    ];
    const { result } = renderHook(() => useChapters({ chapters, duration: 60 }));
    expect(result.current.getChapterAtTime(15).title).toBe('Intro');
    expect(result.current.getChapterAtTime(45).title).toBe('Main');
  });
});
