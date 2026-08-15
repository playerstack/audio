import React from 'react';
import isEqual from 'react-fast-compare';

import { propTypes, defaultProps } from './props.types';
import { isMediaStream } from '@playerstack/core';

const SEEK_ON_PLAY_EXPIRY = 5000;

export default class PlayerProxy extends React.Component {
  static displayName = 'PlayerProxy';
  static propTypes = propTypes;
  static defaultProps = defaultProps;

  progressTimeout = 0;
  durationCheckTimeout = 0;
  seekOnPlayTimeout = 0;
  volumeTimeout = 0;
  prevPlayed = 0;
  prevLoaded = 0;
  player = null;

  loadOnReady = null;
  seekOnPlay = null;

  mounted = false;
  isReady = false;
  isPlaying = false;
  isLoading = true;
  startOnPlay = true;
  onDurationCalled = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    clearTimeout(this.progressTimeout);
    clearTimeout(this.durationCheckTimeout);
    clearTimeout(this.seekOnPlayTimeout);
    clearTimeout(this.volumeTimeout);
    if (this.isReady && this.props.stopOnUnmount) {
      this.player.stop();
    }
    this.mounted = false;
  }

  componentDidUpdate(prevProps) {
    if (!this.player) return;

    const { url, playing, volume, muted, playbackRate, activePlayer, disableDeferredLoading } = this.props;

    if (isEqual(prevProps.url, url) === false) {
      clearTimeout(this.progressTimeout);
      if (this.isLoading && !activePlayer?.forceLoad && !disableDeferredLoading && !isMediaStream(url)) {
        this.loadOnReady = url;
        return;
      }
      this.isLoading = true;
      this.startOnPlay = true;
      this.onDurationCalled = false;
      this.player.load(url, this.isReady);
      return;
    }
    if (prevProps.playing === false && playing && this.isPlaying === false) {
      this.player.play();
    }
    if (prevProps.playing && playing === false && this.isPlaying) {
      this.player.pause();
    }
    if (prevProps.volume !== volume && volume !== null) {
      this.player.setVolume(volume);
    }
    if (prevProps.muted !== muted) {
      if (muted) {
        this.player.mute();
      } else {
        this.player.unmute();
        if (volume !== null) {
          clearTimeout(this.volumeTimeout);
          this.volumeTimeout = setTimeout(() => {
            if (this.mounted && this.player) {
              this.player.setVolume(volume);
            }
          });
        }
      }
    }
    if (prevProps.playbackRate !== playbackRate && this.player.setPlaybackRate) {
      this.player.setPlaybackRate(playbackRate);
    }
  }

  handlePlayerMount = (player) => {
    this.player = player;
    this.player.load(this.props.url);
    this.progress();
  };

  getDuration() {
    if (this.isReady === false) return null;
    return this.player.getDuration();
  }

  getCurrentTime() {
    if (this.isReady === false) return null;
    return this.player.getCurrentTime();
  }

  getSecondsLoaded() {
    if (this.isReady === false) return null;
    return this.player.getSecondsLoaded();
  }

  getInternalPlayer = (key) => {
    if (!this.player) return null;
    return this.player[key];
  };

  getPlayer() {
    return this.player.getPlayer();
  }

  progress = () => {
    if (this.props.url && this.player && this.isReady && this.mounted) {
      const playedSeconds = this.getCurrentTime() || 0;
      const loadedSeconds = this.getSecondsLoaded();
      const duration = this.getDuration();

      if (duration) {
        const progress = {
          playedSeconds,
          played: playedSeconds / duration,
          loadedSeconds: null,
        };
        if (loadedSeconds !== null) {
          progress.loadedSeconds = loadedSeconds;
          progress.loaded = loadedSeconds / duration;
        }
        if (progress.playedSeconds !== this.prevPlayed || progress.loadedSeconds !== this.prevLoaded) {
          this.props.onProgress({
            loaded: progress.loaded,
            loadedSeconds: progress.loadedSeconds,
            played: progress.played,
            playedSeconds: progress.playedSeconds,
          });
        }
        this.prevPlayed = progress.playedSeconds;
        if (progress.loadedSeconds !== undefined) {
          this.prevLoaded = progress.loadedSeconds;
        }
      }
    }
    if (this.isPlaying && this.mounted) {
      this.progressTimeout = setTimeout(this.progress, this.props.progressFrequency || this.props.progressInterval);
    }
  };

  seekTo(amount, type, keepPlaying) {
    if (this.isReady === false) {
      if (amount !== 0) {
        this.seekOnPlay = amount;
        this.seekOnPlayTimeout = setTimeout(() => {
          this.seekOnPlay = null;
        }, SEEK_ON_PLAY_EXPIRY);
      }
      return;
    }
    const isFraction = !type ? amount > 0 && amount < 1 : type === 'fraction';
    if (isFraction) {
      const duration = this.player.getDuration();
      if (!duration) return;
      this.player.seekTo(duration * amount, keepPlaying);
      return;
    }
    this.player.seekTo(amount, keepPlaying);
  }

  handleReady = () => {
    if (this.mounted === false) return;
    this.isReady = true;
    this.isLoading = false;
    const { onReady, playing, volume, muted } = this.props;
    if (onReady) onReady();
    if (!muted && volume !== null) {
      this.player.setVolume(volume);
    }
    if (this.loadOnReady) {
      this.player.load(this.loadOnReady, true);
      this.loadOnReady = null;
    } else if (playing) {
      this.player.play();
    }
    this.handleDurationCheck();
  };

  handlePlay = (e) => {
    this.isPlaying = true;
    this.isLoading = false;
    const { onStart, onPlay, playbackRate } = this.props;
    if (this.startOnPlay) {
      if (this.player.setPlaybackRate && playbackRate !== 1) {
        this.player.setPlaybackRate(playbackRate);
      }
      if (onStart) onStart();
      this.startOnPlay = false;
    }
    if (onPlay) onPlay(e);
    if (this.seekOnPlay) {
      this.seekTo(this.seekOnPlay);
      this.seekOnPlay = null;
    }
    this.handleDurationCheck();
    clearTimeout(this.progressTimeout);
    this.progress();
  };

  handlePause = (e) => {
    this.isPlaying = false;
    if (!this.isLoading && this.props.onPause) {
      this.props.onPause(e);
    }
  };

  handleEnded = () => {
    const { loop, onEnded } = this.props;
    if (loop === true) return; // <audio loop> handles native looping
    this.isPlaying = false;
    if (onEnded) onEnded();
  };

  handleError = (e, data, hls, Hls) => {
    this.isLoading = false;
    if (this.props.onError) this.props.onError(e, data, hls, Hls);
  };

  handleDurationCheck = () => {
    clearTimeout(this.durationCheckTimeout);
    const duration = this.getDuration();
    if (duration) {
      if (!this.onDurationCalled && this.props.onDuration) {
        this.props.onDuration(duration);
        this.onDurationCalled = true;
      }
    } else {
      this.durationCheckTimeout = setTimeout(this.handleDurationCheck, 100);
    }
  };

  handleLoaded = () => {
    if (this.isReady && !this.startOnPlay) {
      this.isLoading = false;
    }
  };

  render() {
    const Player = this.props.activePlayer;
    if (!Player) return null;

    return (
      <Player
        loop={this.props.loop}
        muted={this.props.muted}
        url={this.props.url}
        playing={this.props.playing}
        config={this.props.config}
        onMount={this.handlePlayerMount}
        onReady={this.handleReady}
        onPlay={this.handlePlay}
        onPause={this.handlePause}
        onEnded={this.handleEnded}
        onLoaded={this.handleLoaded}
        onError={this.handleError}
        onBuffer={this.props.onBuffer}
        onBufferEnd={this.props.onBufferEnd}
        onPlayBackRateChange={this.props.onPlayBackRateChange}
        onSeek={this.props.onSeek}
      />
    );
  }
}
