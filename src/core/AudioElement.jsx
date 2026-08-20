import React, { useRef, useEffect, useImperativeHandle } from 'react';

import { MediaEngine, PlayerOrchestrator } from '@playerstack/core';

/**
 * Thin audio element component that wires an <audio> element to
 * core's MediaEngine + PlayerOrchestrator. This replaces the old
 * PlayerCore + PlayerProxy class-based approach.
 *
 * On mount: creates MediaEngine with the audio ref, creates
 * PlayerOrchestrator with the engine.
 * On unmount: calls orchestrator.destroy() which cascades to engine.
 */
const AudioElement = React.forwardRef(function AudioElement(
  {
    url,
    playing,
    volume,
    muted,
    playbackRate,
    loop,
    config = {},
    onProgress,
    onDuration,
    onReady,
    onPlay,
    onPause,
    onEnded,
    onError,
    onSeek,
    onBuffer,
    onBufferEnd,
    onLoaded,
    onPlayBackRateChange,
    onMount,
  },
  ref,
) {
  const audioRef = useRef(null);
  const engineRef = useRef(null);
  const orchestratorRef = useRef(null);
  const mountedRef = useRef(false);

  // Keep callbacks in refs for stable event subscriptions
  const callbacksRef = useRef({
    onProgress,
    onDuration,
    onReady,
    onPlay,
    onPause,
    onEnded,
    onError,
    onSeek,
    onBuffer,
    onBufferEnd,
    onLoaded,
    onPlayBackRateChange,
    onMount,
  });
  callbacksRef.current = {
    onProgress,
    onDuration,
    onReady,
    onPlay,
    onPause,
    onEnded,
    onError,
    onSeek,
    onBuffer,
    onBufferEnd,
    onLoaded,
    onPlayBackRateChange,
    onMount,
  };

  // Expose the audio element and orchestrator to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      getPlayer: () => audioRef.current,
      getOrchestrator: () => orchestratorRef.current,
      getEngine: () => engineRef.current,
      seekTo: (amount, type, keepPlaying) => {
        if (!orchestratorRef.current) return;
        const isFraction = !type ? amount > 0 && amount < 1 : type === 'fraction';
        if (isFraction) {
          const duration = engineRef.current?.getDuration() ?? 0;
          if (!duration) return;
          orchestratorRef.current.seekTo(duration * amount, keepPlaying);
          return;
        }
        orchestratorRef.current.seekTo(amount, keepPlaying);
      },
      getDuration: () => engineRef.current?.getDuration() ?? null,
      getCurrentTime: () => engineRef.current?.getCurrentTime() ?? null,
      getSecondsLoaded: () => engineRef.current?.getSecondsLoaded() ?? null,
      play: () => engineRef.current?.play(),
      pause: () => engineRef.current?.pause(),
      stop: () => engineRef.current?.stop(),
    }),
    [],
  );

  // Create engine + orchestrator on mount
  useEffect(() => {
    mountedRef.current = true;
    const engine = new MediaEngine(audioRef.current, {
      hlsVersion: config.hlsVersion,
      dashVersion: config.dashVersion,
      flvVersion: config.flvVersion,
      forceHLS: config.forceHLS,
      forceDASH: config.forceDASH,
      forceFLV: config.forceFLV,
      forceSafariHLS: config.forceSafariHLS,
      forceDisableHls: config.forceDisableHls,
      hlsOptions: config.hlsOptions,
    });
    const orchestrator = new PlayerOrchestrator(engine);

    engineRef.current = engine;
    orchestratorRef.current = orchestrator;

    // Subscribe to orchestrator events via stable refs
    orchestrator.on('progress', (data) => {
      if (callbacksRef.current.onProgress) callbacksRef.current.onProgress(data);
    });
    orchestrator.on('duration', (duration) => {
      if (callbacksRef.current.onDuration) callbacksRef.current.onDuration(duration);
    });
    orchestrator.on('ready', () => {
      if (callbacksRef.current.onReady) callbacksRef.current.onReady();
    });
    orchestrator.on('play', () => {
      if (callbacksRef.current.onPlay) callbacksRef.current.onPlay();
    });
    orchestrator.on('pause', () => {
      if (callbacksRef.current.onPause) callbacksRef.current.onPause();
    });
    orchestrator.on('ended', () => {
      if (callbacksRef.current.onEnded) callbacksRef.current.onEnded();
    });
    orchestrator.on('error', (error) => {
      if (callbacksRef.current.onError) callbacksRef.current.onError(error);
    });
    orchestrator.on('seek', (time) => {
      if (callbacksRef.current.onSeek) callbacksRef.current.onSeek(time);
    });

    // Subscribe to engine-level events not covered by orchestrator
    engine.on('buffer', () => {
      if (callbacksRef.current.onBuffer) callbacksRef.current.onBuffer();
    });
    engine.on('bufferEnd', () => {
      if (callbacksRef.current.onBufferEnd) callbacksRef.current.onBufferEnd();
    });
    engine.on('loaded', () => {
      if (callbacksRef.current.onLoaded) callbacksRef.current.onLoaded();
    });
    engine.on('playbackRateChange', (rate) => {
      if (callbacksRef.current.onPlayBackRateChange) callbacksRef.current.onPlayBackRateChange(rate);
    });

    // Notify parent that the player is mounted
    if (callbacksRef.current.onMount) callbacksRef.current.onMount();

    return () => {
      mountedRef.current = false;
      orchestrator.destroy();
      engineRef.current = null;
      orchestratorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps — config is stabilized externally; engine is created once
  }, []);

  // Sync playing prop
  useEffect(() => {
    if (orchestratorRef.current) {
      orchestratorRef.current.setPlaying(playing);
    }
  }, [playing]);

  // Sync volume prop
  useEffect(() => {
    if (orchestratorRef.current && volume !== null && volume !== undefined) {
      orchestratorRef.current.setVolume(volume);
    }
  }, [volume]);

  // Sync muted prop
  useEffect(() => {
    if (orchestratorRef.current) {
      orchestratorRef.current.setMuted(muted);
    }
  }, [muted]);

  // Sync playbackRate prop
  useEffect(() => {
    if (orchestratorRef.current && playbackRate !== undefined) {
      orchestratorRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  // Sync loop prop
  useEffect(() => {
    if (orchestratorRef.current) {
      orchestratorRef.current.setLoop(!!loop);
    }
  }, [loop]);

  // Sync URL — load new source when URL changes
  useEffect(() => {
    if (orchestratorRef.current && url) {
      orchestratorRef.current.load(url);
    }
  }, [url]);

  return (
    <audio
      data-testid="audio-element"
      ref={audioRef}
      style={{ display: 'none' }}
      preload="auto"
      autoPlay={playing || undefined}
      controls={false}
      muted={muted}
      loop={loop}
      {...config.attributes}
    />
  );
});

AudioElement.displayName = 'AudioElement';

export default AudioElement;
