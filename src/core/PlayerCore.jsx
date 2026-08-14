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
} from '@playerstack/core';
import { isMediaStream } from '../utils';
import { getSDK, hasAudio, supportsWebKitPresentationMode } from '../utils/player';

export default class PlayerCore extends React.Component {
  static displayName = 'PlayerCore';
  static canPlay = canPlay;

  componentDidMount() {
    if (this.props.onMount) {
      this.props.onMount(this);
    }
    this.addListeners(this.player);
    const src = this.getSource(this.props.url); // Ensure src is set in strict mode

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
    // Only add listeners if not already attached to prevent duplicate registrations
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
    const { url, playsinline } = this.props;

    if (!player) {
      return;
    }

    // Remove existing listeners first to prevent duplicates
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
    player.addEventListener('enterpictureinpicture', this.onEnablePIP);
    player.addEventListener('leavepictureinpicture', this.onDisablePIP);
    player.addEventListener('webkitpresentationmodechanged', this.onPresentationModeChange);

    // if (url instanceof Array === false && this.shouldUseHLS(url) === false) {
    if (this.shouldUseHLS(url) === false) {
      // onReady is handled by hls.js
      player.addEventListener('canplay', this.onReady);
    }
    if (playsinline) {
      player.setAttribute('playsinline', '');
      player.setAttribute('webkit-playsinline', '');
      player.setAttribute('x5-playsinline', '');
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
    player.removeEventListener('enterpictureinpicture', this.onEnablePIP);
    player.removeEventListener('leavepictureinpicture', this.onDisablePIP);
    player.removeEventListener('webkitpresentationmodechanged', this.onPresentationModeChange);
  }

  // Proxy methods to prevent listener leaks
  onReady = (e) => {
    return this.props.onReady(e);
  };
  onPlay = (e) => {
    return this.props.onPlay({
      ...e,
      hasAudio: hasAudio(this.player),
    });
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

  onEnablePIP = (e) => {
    return this.props.onEnablePIP(e);
  };

  onDisablePIP = (e) => {
    const { onDisablePIP, playing } = this.props;
    if (onDisablePIP) {
      onDisablePIP(e);
    }
    if (playing) {
      this.play();
    }
  };

  onPresentationModeChange = (e) => {
    if (this.player && supportsWebKitPresentationMode(this.player)) {
      const { webkitPresentationMode } = this.player;
      if (webkitPresentationMode === 'picture-in-picture') {
        this.onEnablePIP(e);
      } else if (webkitPresentationMode === 'inline') {
        this.onDisablePIP(e);
      }
    }
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
    const { hlsVersion, hlsOptions, dashVersion, flvVersion, live } = this.props.config;
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

    // Increment load sequence to ignore stale SDK load callbacks
    this.loadSequence = (this.loadSequence || 0) + 1;
    const currentSequence = this.loadSequence;

    if (this.shouldUseHLS(url)) {
      getSDK(HLS_SDK_URL.replace('VERSION', hlsVersion), HLS_GLOBAL)
        .then((Hls) => {
          if (currentSequence !== this.loadSequence) return; // Stale load

          // For live streams, apply buffer management defaults to prevent
          // SourceBuffer overflow. User-provided hlsOptions take precedence.
          const liveDefaults = live ? { maxBufferLength: 30, maxMaxBufferLength: 60, backBufferLength: 30 } : {};

          this.hls = new Hls({ ...liveDefaults, ...hlsOptions });
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
          if (currentSequence !== this.loadSequence) return; // Stale load
          this.dash = dashjs.MediaPlayer().create();
          this.dash.initialize(this.player, url, this.props.playing);
          this.dash.on('error', (e) => {
            this.props.onError(e, null, this.dash, dashjs);
          });
          if (parseInt(dashVersion) < 3) {
            // This function does not exist in dash.js version 3.0.0 and later
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
          if (currentSequence !== this.loadSequence) return; // Stale load
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

  enablePIP() {
    if (this.player.requestPictureInPicture && document.pictureInPictureElement !== this.player) {
      const promise = this.player.requestPictureInPicture();
      if (promise && promise.catch) {
        promise.catch((err) => this.props.onError(err));
      }
    } else if (
      supportsWebKitPresentationMode(this.player) &&
      this.player.webkitPresentationMode !== 'picture-in-picture'
    ) {
      this.player.webkitSetPresentationMode('picture-in-picture');
    }
  }

  disablePIP() {
    if (document.exitPictureInPicture && document.pictureInPictureElement === this.player) {
      document.exitPictureInPicture();
    } else if (supportsWebKitPresentationMode(this.player) && this.player.webkitPresentationMode !== 'inline') {
      this.player.webkitSetPresentationMode('inline');
    }
  }

  setPlaybackRate(rate) {
    try {
      this.player.playbackRate = rate;
    } catch (error) {
      this.props.onError(error);
    }
  }

  getDuration() {
    if (!this.player) return null;
    const { duration, seekable } = this.player;
    // on iOS, live streams return Infinity for the duration
    // so instead we use the end of the seekable timerange
    if (duration === Infinity && seekable.length > 0) {
      return seekable.end(seekable.length - 1);
    }
    return duration;
  }

  getCurrentTime() {
    if (!this.player) {
      return null;
    }
    return this.player.currentTime;
  }

  getSecondsLoaded() {
    if (!this.player) {
      return null;
    }
    const { buffered } = this.player;
    if (buffered.length === 0) {
      return 0;
    }
    const end = buffered.end(buffered.length - 1);
    const duration = this.getDuration();
    if (duration !== null && end > duration) {
      return duration;
    }
    return end;
  }

  getSource(url) {
    if (isMediaStream(url) || this.shouldUseHLS(url) || this.shouldUseDASH(url) || this.shouldUseFLV(url)) {
      return undefined;
    }

    return url;
  }

  renderTrack = (track, index) => {
    return <track key={index} {...track} />;
  };

  ref = (player) => {
    if (this.player) {
      // Store previous player to be used by removeListeners()
      this.prevPlayer = this.player;
    }
    this.player = player;
  };

  render() {
    const { url, playing, loop, muted, config, width, height, viewType } = this.props;

    const isAudio = viewType === 'audio';

    const style = isAudio
      ? { display: 'none' }
      : {
          width: width === 'auto' ? width : '100%',
          height: height === 'auto' ? height : '100%',
        };

    const Element = isAudio ? 'audio' : 'video';

    return (
      <Element
        data-testid={isAudio ? 'audio-element' : 'video-element'}
        ref={this.ref}
        src={this.getSource(url)}
        style={style}
        preload="auto"
        autoPlay={playing || undefined}
        controls={false}
        muted={muted}
        loop={loop}
        {...config.attributes}
      >
        {config.tracks?.map(this.renderTrack)}
      </Element>
    );
  }
}
