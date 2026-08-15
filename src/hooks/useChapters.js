import React from 'react';
import { computeChapterSegments, getChapterAtTime as coreGetChapterAtTime } from '@playerstack/core';
import useDeepCompareMemoize from './useDeepCompareMemoize';

/**
 * Hook that processes chapter definitions and provides chapter-related
 * utilities for the audio player timeline.
 */
const useChapters = ({ chapters, duration }) => {
  const stableChapters = useDeepCompareMemoize(chapters);

  const segments = React.useMemo(() => computeChapterSegments(stableChapters, duration), [stableChapters, duration]);

  const getChapterAtTime = React.useCallback((time) => coreGetChapterAtTime(segments, time), [segments]);

  return { segments, getChapterAtTime };
};

export default useChapters;
