import React from 'react';

import AudioElement from '@core/AudioElement';
import AudioPlayerSkin from '@AudioPlayer/AudioPlayerSkin';
import { audioPlayerStateInitial as playerStateInitial } from '@playerstack/core';
import usePlayerProxy from '@AudioMediaPlayer/hooks/usePlayerProxy';
import { useVolume } from '@hooks/useVolume';
import { createWebVolumeAdapter } from '@utils/volumeAdapter';
import { Provider } from '@context/index';
import AudioPlayerWrapper from '@AudioMediaPlayer/AudioPlayerWrapper';

const AudioMediaPlayerSkin = React.forwardRef((props, ref) => {
  const [playerState, setPlayerState] = React.useState({
    ...playerStateInitial,
    isMuted: props.muted,
    playbackRate: props.playbackRate,
    loop: props.loop,
    playing: props.playing,
    volume: props.muted ? 0 : (props.volume ?? playerStateInitial.volume),
  });

  const [prevProps, setPrevProps] = React.useState({
    playbackRate: props.playbackRate,
    loop: props.loop,
    playing: props.playing,
    muted: props.muted,
    volume: props.volume,
  });

  // Sync external props to internal state
  if (
    props.playbackRate !== prevProps.playbackRate ||
    props.loop !== prevProps.loop ||
    props.playing !== prevProps.playing ||
    props.muted !== prevProps.muted ||
    props.volume !== prevProps.volume
  ) {
    setPrevProps({
      playbackRate: props.playbackRate,
      loop: props.loop,
      playing: props.playing,
      muted: props.muted,
      volume: props.volume,
    });
    setPlayerState((prevState) => {
      const next = { ...prevState };
      if (props.playbackRate !== prevProps.playbackRate) {
        next.playbackRate = props.playbackRate;
      }
      if (props.loop !== prevProps.loop) {
        next.loop = props.loop;
      }
      if (props.playing !== prevProps.playing) {
        next.playing = props.playing;
      }
      if (props.muted !== prevProps.muted) {
        next.isMuted = props.muted;
        next.volume = props.muted ? 0 : (props.volume ?? playerStateInitial.volume);
      }
      if (props.volume !== prevProps.volume && !props.muted) {
        next.volume = props.volume ?? playerStateInitial.volume;
      }
      return next;
    });
  }

  const playerRef = React.useRef(null);
  const videoRef = React.useRef(null);

  // Track source changes
  const prevUrlRef = React.useRef(props.url);

  React.useEffect(() => {
    if (prevUrlRef.current !== props.url) {
      prevUrlRef.current = props.url;
      setPlayerState((prev) => ({
        ...prev,
        isLoading: true,
        isBuffering: false,
        duration: 0,
        played: 0,
        loaded: 0,
        isEnded: false,
        kernelError: null,
        seeking: false,
      }));
    }
  }, [props.url]);

  // Auto-play main content when ads deactivates
  const prevAdsRef = React.useRef(props.ads);
  React.useEffect(() => {
    const wasAdActive = prevAdsRef.current !== null && prevAdsRef.current !== undefined;
    const isAdActive = props.ads !== null && props.ads !== undefined;
    prevAdsRef.current = props.ads;
    if (wasAdActive && !isAdActive) {
      setPlayerState((prev) => ({ ...prev, playing: true }));
    }
  }, [props.ads]);

  const { videoUrl, ...playerProxy } = usePlayerProxy({
    onBuffer: props.onBuffer,
    onBufferEnd: props.onBufferEnd,
    onDuration: props.onDuration,
    onEnded: props.onEnded,
    onError: props.onError,
    onPause: props.onPause,
    onPlay: props.onPlay,
    onPlayBackRateChange: props.onPlayBackRateChange,
    onProgress: props.onProgress,
    onReady: props.onReady,
    onSeek: props.onSeek,
    onStart: props.onStart,
    onLoaded: props.onLoaded,
    onMount: props.onMount,
    updateState: setPlayerState,
    playerState,
    extraProps: {
      url: props.url,
      sources: [],
      prevented: false,
    },
  });

  const playerConfig = React.useMemo(
    () => ({
      attributes: props.config.attributes,
      tracks: props.config.tracks,
      forceHLS: props.config.forceHLS,
      dashVersion: props.config.dashVersion,
      forceDASH: props.config.forceDASH,
      forceFLV: props.config.forceFLV,
      flvVersion: props.config.flvVersion,
      forceDisableHls: props.config.forceDisableHls,
      hlsOptions: props.config.hlsOptions,
      hlsVersion: props.config.hlsVersion,
      forceSafariHLS: props.config.forceSafariHLS,
    }),
    [props.config],
  );

  // Volume management
  const volumeAdapter = React.useMemo(() => createWebVolumeAdapter(videoRef), []);
  const { onMutedClick, changeVolume } = useVolume({
    adapter: volumeAdapter,
    muted: playerState.isMuted,
    updateState: ({ muted, volume }) =>
      setPlayerState((prev) => ({
        ...prev,
        isMuted: muted ?? false,
        volume: volume ?? 0,
      })),
  });

  // Keep videoRef in sync with player element
  React.useEffect(() => {
    if (props.player) {
      videoRef.current = props.player.getPlayer() ?? null;
    }
  }, [props.player]);

  // Playback controls
  const onPlayClick = React.useCallback(() => {
    setPlayerState((prev) => ({ ...prev, playing: true }));
  }, []);

  const onPauseClick = React.useCallback(() => {
    setPlayerState((prev) => ({ ...prev, playing: false }));
  }, []);

  const onTogglePlay = React.useCallback(() => {
    setPlayerState((prev) => ({ ...prev, playing: !prev.playing }));
  }, []);

  const changeCurrentTime = React.useCallback(
    (time) => {
      if (!props.player) return;
      setPlayerState((prev) => ({ ...prev, played: time }));
      props.player.seekTo(time);
    },
    [props.player],
  );

  const onSeeking = React.useCallback((seeking) => {
    setPlayerState((prev) => ({ ...prev, seeking }));
  }, []);

  const changePlaybackRate = React.useCallback((rate) => {
    setPlayerState((prev) => ({ ...prev, playbackRate: rate }));
  }, []);

  return (
    <Provider language={props.language}>
      <AudioPlayerWrapper ref={playerRef} tabIndex={0} role="application" dir="ltr">
        {videoUrl && (
          <AudioElement
            ref={ref}
            loop={playerState.loop}
            muted={playerState.isMuted}
            playbackRate={playerState.playbackRate}
            volume={playerState.volume}
            url={videoUrl}
            playing={playerState.playing}
            config={playerConfig}
            {...playerProxy}
          />
        )}
        <AudioPlayerSkin
          videoRef={videoRef}
          playerRef={playerRef}
          hasResource={typeof videoUrl === 'string'}
          hasAudio={true}
          loading={playerState.isLoading}
          paused={playerState.playing === false}
          ended={playerState.isEnded}
          seeking={playerState.seeking}
          waiting={playerState.isBuffering || props.waiting}
          duration={playerState.duration}
          buffered={playerState.loaded}
          bufferedRanges={playerState.bufferedRanges || []}
          currentTime={playerState.played}
          muted={playerState.isMuted}
          volume={playerState.volume}
          playbackRate={playerState.playbackRate}
          loop={playerState.loop}
          poster={props.poster}
          title={props.title}
          artist={props.artist}
          chapters={props.chapters}
          onPlayClick={onPlayClick}
          onPauseClick={onPauseClick}
          onTogglePlay={onTogglePlay}
          changeVolume={changeVolume}
          onMutedClick={onMutedClick}
          changeCurrentTime={changeCurrentTime}
          changePlaybackRate={changePlaybackRate}
          onSeeking={onSeeking}
          onPrevious={props.onPrevious}
          onNext={props.onNext}
          showNavButtons={props.showNavButtons}
          ads={props.ads}
        />
      </AudioPlayerWrapper>
    </Provider>
  );
});

AudioMediaPlayerSkin.displayName = 'AudioMediaPlayerSkin';

export default React.memo(
  AudioMediaPlayerSkin,
  (p, n) =>
    p.url === n.url &&
    p.playing === n.playing &&
    p.loop === n.loop &&
    p.volume === n.volume &&
    p.muted === n.muted &&
    p.playbackRate === n.playbackRate &&
    p.width === n.width &&
    p.progressInterval === n.progressInterval &&
    p.playsinline === n.playsinline &&
    p.stopOnUnmount === n.stopOnUnmount &&
    p.activePlayer === n.activePlayer &&
    p.player === n.player &&
    p.waiting === n.waiting &&
    p.language === n.language &&
    p.poster === n.poster &&
    p.title === n.title &&
    p.artist === n.artist &&
    p.config === n.config &&
    p.onReady === n.onReady &&
    p.onStart === n.onStart &&
    p.onPlay === n.onPlay &&
    p.onPause === n.onPause &&
    p.onBuffer === n.onBuffer &&
    p.onBufferEnd === n.onBufferEnd &&
    p.onEnded === n.onEnded &&
    p.onError === n.onError &&
    p.onDuration === n.onDuration &&
    p.onSeek === n.onSeek &&
    p.onPlayBackRateChange === n.onPlayBackRateChange &&
    p.onProgress === n.onProgress &&
    p.onLoaded === n.onLoaded &&
    p.onMount === n.onMount &&
    p.onPrevious === n.onPrevious &&
    p.onNext === n.onNext &&
    p.showNavButtons === n.showNavButtons &&
    p.ads === n.ads,
);
