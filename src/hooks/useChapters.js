import React from 'react';
import useDeepCompareMemoize from './useDeepCompareMemoize';

/**
 * Hook that processes chapter definitions and provides chapter-related
 * utilities for the time slider (segment boundaries, active chapter, etc.)
 *
 * @param {{ chapters: Array<{ title: string, startTime: number }>, duration: number }} params
 * @returns {{
 *   segments: Array<{ title: string, startTime: number, endTime: number, startPercent: number, endPercent: number }>,
 *   activeChapter: { title: string, startTime: number, endTime: number } | null,
 *   getChapterAtTime: (time: number) => { title: string, startTime: number, endTime: number } | null,
 * }}
 */
const useChapters = ({ chapters, duration }) => {
  const stableChapters = useDeepCompareMemoize(chapters);

  const segments = React.useMemo(() => {
    if (!stableChapters || stableChapters.length === 0 || duration <= 0) {
      return [];
    }

    // Sort chapters by startTime ascending, filter out chapters beyond duration
    const sorted = [...stableChapters].filter((c) => c.startTime < duration).sort((a, b) => a.startTime - b.startTime);

    return sorted.map((chapter, index) => {
      const rawEnd = index < sorted.length - 1 ? sorted[index + 1].startTime : duration;
      const endTime = Math.min(rawEnd, duration);
      return {
        title: chapter.title,
        startTime: chapter.startTime,
        endTime,
        startPercent: (chapter.startTime / duration) * 100,
        endPercent: (endTime / duration) * 100,
      };
    });
  }, [stableChapters, duration]);

  const getChapterAtTime = React.useCallback(
    (time) => {
      if (segments.length === 0) return null;
      // Find the last segment whose startTime <= time
      for (let i = segments.length - 1; i >= 0; i--) {
        if (time >= segments[i].startTime) {
          return segments[i];
        }
      }
      return segments[0];
    },
    [segments],
  );

  return {
    segments,
    getChapterAtTime,
  };
};

export default useChapters;
