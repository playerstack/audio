import React from 'react';
import isEqual from 'react-fast-compare';

import { propTypes, defaultProps } from './props.types';
import { isMediaStream } from '../utils';

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
  isPlaying = false; // Track playing state internally to prevent bugs
  isLoading = true; // Use isLoading to prevent onPause when switching URL
  isSwitchingQuality = false; // Suppress onPause during quality switch until play resumes
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

      if (this.player.disablePIP) {
        this.player.disablePIP();
      }
    }
    this.mounted = false;
  }

  componentDidUpdate(prevProps) {
    // If there isn’t a player available, don’t do anything
    if (!this.player) {
      return;
    }
    // Invoke player methods based on changed props
    const { url, playing, volume, muted, playbackRate, playbackQuality, pip, activePlayer, disableDeferredLoading } =
      this.props;

    if (isEqual(prevProps.url, url) === false) {
      // Clear any existing progress loop to prevent multiple simultaneous loops
      clearTimeout(this.progressTimeout);
      if (this.isLoading && !activePlayer?.forceLoad && !disableDeferredLoading && !isMediaStream(url)) {
        console.warn(`PlayerStack: the attempt to load ${url} is being deferred until the player has loaded`);
        this.loadOnReady = url;
        return;
      }
      this.isLoading = true;
      this.startOnPlay = true;
      this.onDurationCalled = false;
      // When switching quality, remember the current position to seek after the new source loads
      if (prevProps.playbackQuality !== playbackQuality) {
        this.seekOnPlay = this.prevPlayed;
        this.isSwitchingQuality = true;
      }
      this.player.load(url, this.isReady);
      // Don't process play/pause/volume changes in the same cycle as a URL change.
      // handleReady will resume playback once the new source is loaded.
      return;
    }
    if (prevProps.playing === false && playing && this.isPlaying === false) {
      this.player.play();
    }
    if (prevProps.playing && playing === false && this.isPlaying) {
      this.player.pause();
    }
    if (prevProps.pip === false && pip && this.player.enablePIP) {
      this.player.enablePIP();
    }
    if (prevProps.pip && pip === false && this.player.disablePIP) {
      this.player.disablePIP();
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
          // Set volume next tick to fix a bug with DailyMotion
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
    // Handle caption track activation/deactivation
    if (prevProps.activeCaption !== this.props.activeCaption) {
      const videoElement = this.player.getPlayer();
      if (videoElement && videoElement.textTracks) {
        for (let i = 0; i < videoElement.textTracks.length; i++) {
          const track = videoElement.textTracks[i];
          if (this.props.activeCaption === null) {
            track.mode = 'disabled';
          } else if (track.language === this.props.activeCaption) {
            // Use 'hidden' to get cue events without native rendering
            // (custom CaptionOverlay handles display)
            track.mode = 'hidden';
          } else {
            track.mode = 'disabled';
          }
        }
      }
    }
  }

  handlePlayerMount = (player) => {
    // if (this.player) {
    //   this.progress(); // Ensure onProgress is still called in strict mode
    //   return; // Return here to prevent loading twice in strict mode
    // }
    this.player = player;
    this.player.load(this.props.url);
    this.progress();
  };

  getDuration() {
    if (this.isReady === false) {
      return null;
    }
    return this.player.getDuration();
  }

  getCurrentTime() {
    if (this.isReady === false) {
      return null;
    }
    return this.player.getCurrentTime();
  }

  getSecondsLoaded() {
    if (this.isReady === false) {
      return null;
    }
    return this.player.getSecondsLoaded();
  }

  getInternalPlayer = (key) => {
    if (!this.player) {
      return null;
    }
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
        // Check this types
        const progress = {
          playedSeconds,
          played: playedSeconds / duration,
          loadedSeconds: null,
        };
        // Check this types
        if (loadedSeconds !== null) {
          progress.loadedSeconds = loadedSeconds;
          progress.loaded = loadedSeconds / duration;
        }
        // Only call onProgress if values have changed
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
    // Only schedule next tick if still playing to save CPU when paused
    if (this.isPlaying && this.mounted) {
      this.progressTimeout = setTimeout(this.progress, this.props.progressFrequency || this.props.progressInterval);
    }
  };

  seekTo(amount, type, keepPlaying) {
    // When seeking before player is ready, store value and seek later
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
      // Convert fraction to seconds based on duration
      const duration = this.player.getDuration();
      if (!duration) {
        console.warn('PlayerStack: could not seek using fraction – duration not yet available');
        return;
      }
      this.player.seekTo(duration * amount, keepPlaying);
      return;
    }
    this.player.seekTo(amount, keepPlaying);
  }

  handleReady = () => {
    if (this.mounted === false) {
      return;
    }
    this.isReady = true;
    this.isLoading = false;
    const { onReady, playing, volume, muted } = this.props;
    if (onReady) {
      onReady();
    }
    if (!muted && volume !== null) {
      this.player.setVolume(volume);
    }
    if (this.loadOnReady) {
      this.player.load(this.loadOnReady, true);
      this.loadOnReady = null;
    } else if (playing || this.isSwitchingQuality) {
      this.player.play();
    }
    this.handleDurationCheck();
  };

  handlePlay = (e) => {
    this.isPlaying = true;
    this.isLoading = false;
    this.isSwitchingQuality = false;
    const { onStart, onPlay, playbackRate } = this.props;
    if (this.startOnPlay) {
      if (this.player.setPlaybackRate && playbackRate !== 1) {
        this.player.setPlaybackRate(playbackRate);
      }
      if (onStart) {
        onStart();
      }
      this.startOnPlay = false;
    }
    if (onPlay) {
      onPlay(e);
    }
    if (this.seekOnPlay) {
      this.seekTo(this.seekOnPlay);
      this.seekOnPlay = null;
    }
    this.handleDurationCheck();
    // Restart progress loop since it stops when paused
    clearTimeout(this.progressTimeout);
    this.progress();
  };

  handlePause = (e) => {
    this.isPlaying = false;
    if (!this.isLoading && !this.isSwitchingQuality && this.props.onPause) {
      this.props.onPause(e);
    }
  };

  handleEnded = () => {
    const { activePlayer, loop, onEnded } = this.props;

    if (loop === true) {
      // If loopOnEnded is configured, use seekTo for seamless looping
      if (
        activePlayer.defaultProps !== undefined &&
        activePlayer.defaultProps.config !== undefined &&
        activePlayer.defaultProps.config.loopOnEnded
      ) {
        this.seekTo(0);
      }
      // With loop=true, the <video loop> attribute handles native looping.
      // Don't set isPlaying=false or call onEnded when looping.
      return;
    }
    // Not looping — mark as stopped and notify consumer
    this.isPlaying = false;
    if (onEnded) {
      onEnded();
    }
  };

  handleError = (e, data, hls, Hls) => {
    this.isLoading = false;
    if (this.props.onError) {
      this.props.onError(e, data, hls, Hls);
    }
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
    // Only clear isLoading if we're not waiting for onReady to fire.
    // During URL/quality switches, handleReady will clear isLoading
    // after the source is actually ready to play.
    if (this.isReady && !this.startOnPlay) {
      this.isLoading = false;
    }
  };

  render() {
    const Player = this.props.activePlayer;

    if (!Player) {
      return null;
    }

    return (
      <Player
        loop={this.props.loop}
        muted={this.props.muted}
        playsinline={this.props.playsinline}
        url={this.props.url}
        width={this.props.width}
        height={this.props.height}
        playing={this.props.playing}
        viewType={this.props.viewType}
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
        onDisablePIP={this.props.onDisablePIP}
        onEnablePIP={this.props.onEnablePIP}
        onPlayBackRateChange={this.props.onPlayBackRateChange}
        onSeek={this.props.onSeek}
      />
    );
  }
}
