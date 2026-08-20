import { useMemo, useCallback } from 'react';

import { computeChapterSegments, getChapterAtTime as coreGetChapterAtTime } from '@playerstack/core';

import { useDeepCompareMemoize } from '@hooks/useDeepCompareMemoize';

/**
 * Hook that processes chapter definitions and provides chapter-related
 * utilities for the time slider (segment boundaries, active chapter, etc.)
 *
 * Uses useDeepCompareMemoize to stabilize the chapters prop reference,
 * then useMemo to compute segments via core's computeChapterSegments.
 * Also exposes a stable getChapterAtTime callback.
 *
 * Previously lived in @playerstack/core/hooks. Now local to audio since core
 * no longer exports React hooks.
 *
 * @param {{ chapters: Array, duration: number }} params
 * @returns {{ segments: Array, getChapterAtTime: function }}
 */
export function useChapters({ chapters, duration }) {
  const stableChapters = useDeepCompareMemoize(chapters);

  const segments = useMemo(() => computeChapterSegments(stableChapters, duration), [stableChapters, duration]);

  const getChapterAtTime = useCallback((time) => coreGetChapterAtTime(segments, time), [segments]);

  return { segments, getChapterAtTime };
}
