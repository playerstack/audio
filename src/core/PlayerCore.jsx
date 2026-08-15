import React from 'react';

import {
  IS_IOS,
  IS_SAFARI,
  HLS_SDK_URL,
  HLS_GLOBAL,
  DASH_SDK_URL,
  DASH_GLOBAL,
  FLV_SDK_URL,
  FLV_GLOBAL,
  canPlay,
  HLS_EXTENSIONS,
  DASH_EXTENSIONS,
  FLV_EXTENSIONS,
  isMediaStream,
  getSDK,
} from '@playerstack/core';

export default class PlayerCore extends React.Component {
  static displayName = 'PlayerCore';
  static canPlay = canPlay;

  componentDidMount() {
    if (this.props.onMount) {
      this.props.onMount(this);
    }
    this.addListeners(this.player);
    const src = this.getSource(this.props.url);

    if (src) {
      this.player.src = src;
    }
    if (IS_IOS || this.props.config.forceDisableHls) {
      this.player.load();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.prevPlayer && this.prevPlayer !== this.player) {
      this.removeListeners(this.prevPlayer);
      this.listenersAttached = false;
    }
    if (!this.listenersAttached) {
      this.addListeners(this.player);
    }
    if (this.props.url !== prevProps.url && isMediaStream(this.props.url) === false) {
      this.player.srcObject = null;
    }
  }

  componentWillUnmount() {
    this.player.removeAttribute('src');
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    if (this.dash) {
      this.dash.reset();
      this.dash = null;
    }
    if (this.flv) {
      this.flv.unload();
      this.flv.detachMediaElement();
      this.flv.destroy();
      this.flv = null;
    }
    this.removeListeners(this.player);
    this.listenersAttached = false;
  }

  addListeners(player) {
    const { url } = this.props;

    if (!player) {
      return;
    }

    this.removeListeners(player);
    this.listenersAttached = true;

    player.addEventListener('play', this.onPlay);
    player.addEventListener('waiting', this.onBuffer);
    player.addEventListener('playing', this.onBufferEnd);
    player.addEventListener('pause', this.onPause);
    player.addEventListener('seeked', this.onSeek);
    player.addEventListener('ended', this.onEnded);
    player.addEventListener('error', this.onError);
    player.addEventListener('ratechange', this.onPlayBackRateChange);

    if (this.shouldUseHLS(url) === false) {
      player.addEventListener('canplay', this.onReady);
    }
  }

  removeListeners(player) {
    if (!player) {
      return;
    }
    player.removeEventListener('canplay', this.onReady);
    player.removeEventListener('play', this.onPlay);
    player.removeEventListener('waiting', this.onBuffer);
    player.removeEventListener('playing', this.onBufferEnd);
    player.removeEventListener('pause', this.onPause);
    player.removeEventListener('seeked', this.onSeek);
    player.removeEventListener('ended', this.onEnded);
    player.removeEventListener('error', this.onError);
    player.removeEventListener('ratechange', this.onPlayBackRateChange);
  }

  onReady = (e) => {
    return this.props.onReady(e);
  };
  onPlay = (e) => {
    return this.props.onPlay(e);
  };
  onBuffer = (e) => {
    return this.props.onBuffer(e);
  };
  onBufferEnd = (e) => {
    return this.props.onBufferEnd(e);
  };
  onPause = (e) => {
    return this.props.onPause(e);
  };
  onEnded = (e) => {
    return this.props.onEnded(e);
  };
  onError = (evt, data, hls, Hls) => {
    return this.props.onError(evt, data, hls, Hls);
  };
  onPlayBackRateChange = (e) => {
    this.props.onPlayBackRateChange(e.target.playbackRate);
  };
  onSeek = (e) => {
    this.props.onSeek(e.target?.currentTime);
  };

  shouldUseHLS(url) {
    if ((IS_SAFARI && this.props.config.forceSafariHLS) || this.props.config.forceHLS) {
      return true;
    }
    if (IS_IOS || this.props.config.forceDisableHls) {
      return false;
    }
    return HLS_EXTENSIONS.test(url);
  }

  shouldUseDASH(url) {
    return DASH_EXTENSIONS.test(url) || this.props.config.forceDASH;
  }

  shouldUseFLV(url) {
    return FLV_EXTENSIONS.test(url) || this.props.config.forceFLV;
  }

  load(url, isReady) {
    const { hlsVersion, hlsOptions, dashVersion, flvVersion } = this.props.config;
    if (isReady === false) {
      return;
    }
    if (this.hls) {
      this.hls.destroy();
    }
    if (this.dash) {
      this.dash.reset();
    }
    if (this.flv) {
      this.flv.unload();
    }

    this.loadSequence = (this.loadSequence || 0) + 1;
    const currentSequence = this.loadSequence;

    if (this.shouldUseHLS(url)) {
      getSDK(HLS_SDK_URL.replace('VERSION', hlsVersion), HLS_GLOBAL)
        .then((Hls) => {
          if (currentSequence !== this.loadSequence) return;

          this.hls = new Hls({ ...hlsOptions });
          this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.props.onReady();
          });
          this.hls.on(Hls.Events.ERROR, (event, data) => {
            this.props.onError(event, data, this.hls, Hls);
          });
          this.hls.loadSource(url);
          this.hls.attachMedia(this.player);
          this.props.onLoaded();
        })
        .catch((err) => this.props.onError(err));
    } else if (this.shouldUseDASH(url)) {
      getSDK(DASH_SDK_URL.replace('VERSION', dashVersion), DASH_GLOBAL)
        .then((dashjs) => {
          if (currentSequence !== this.loadSequence) return;
          this.dash = dashjs.MediaPlayer().create();
          this.dash.initialize(this.player, url, this.props.playing);
          this.dash.on('error', (e) => {
            this.props.onError(e, null, this.dash, dashjs);
          });
          if (parseInt(dashVersion) < 3) {
            this.dash.getDebug().setLogToBrowserConsole(false);
          } else {
            this.dash.updateSettings({
              debug: { logLevel: dashjs.LogLevel.LOG_LEVEL_NONE },
            });
          }
          this.props.onLoaded();
        })
        .catch((err) => this.props.onError(err));
    } else if (this.shouldUseFLV(url)) {
      getSDK(FLV_SDK_URL.replace('VERSION', flvVersion), FLV_GLOBAL)
        .then((flvjs) => {
          if (currentSequence !== this.loadSequence) return;
          this.flv = flvjs.createPlayer({ type: 'flv', url });
          this.flv.attachMediaElement(this.player);
          this.flv.on(flvjs.Events.ERROR, (e, data) => {
            this.props.onError(e, data, this.flv, flvjs);
          });
          this.flv.load();
          this.props.onLoaded();
        })
        .catch((err) => this.props.onError(err));
    } else if (isMediaStream(url)) {
      try {
        this.player.srcObject = url;
      } catch (e) {
        this.player.src = window.URL.createObjectURL(url);
      }
    }
  }

  getPlayer() {
    return this.player;
  }

  play() {
    const promise = this.player.play();
    if (promise) {
      promise.catch(this.props.onError);
    }
  }

  pause() {
    this.player.pause();
  }

  stop() {
    this.player.removeAttribute('src');
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    if (this.dash) {
      this.dash.reset();
      this.dash = null;
    }
    if (this.flv) {
      this.flv.unload();
      this.flv.detachMediaElement();
      this.flv.destroy();
      this.flv = null;
    }
  }

  seekTo(seconds, keepPlaying = true) {
    this.player.currentTime = seconds;
    if (keepPlaying === false) {
      this.pause();
    }
  }

  setVolume(fraction) {
    this.player.volume = fraction;
  }

  mute = () => {
    this.player.muted = true;
  };

  unmute = () => {
    this.player.muted = false;
  };

  setPlaybackRate(rate) {
    try {
      this.player.playbackRate = rate;
    } catch (error) {
      this.props.onError(error);
    }
  }

  getDuration() {
    if (!this.player) return null;
    const { duration } = this.player;
    return duration;
  }

  getCurrentTime() {
    if (!this.player) return null;
    return this.player.currentTime;
  }

  getSecondsLoaded() {
    if (!this.player) return null;
    const { buffered } = this.player;
    if (buffered.length === 0) return 0;
    const end = buffered.end(buffered.length - 1);
    const duration = this.getDuration();
    if (duration !== null && end > duration) return duration;
    return end;
  }

  getSource(url) {
    if (isMediaStream(url) || this.shouldUseHLS(url) || this.shouldUseDASH(url) || this.shouldUseFLV(url)) {
      return undefined;
    }
    return url;
  }

  ref = (player) => {
    if (this.player) {
      this.prevPlayer = this.player;
    }
    this.player = player;
  };

  render() {
    const { url, playing, loop, muted, config } = this.props;

    return (
      <audio
        data-testid="audio-element"
        ref={this.ref}
        src={this.getSource(url)}
        style={{ display: 'none' }}
        preload="auto"
        autoPlay={playing || undefined}
        controls={false}
        muted={muted}
        loop={loop}
        {...config.attributes}
      />
    );
  }
}
