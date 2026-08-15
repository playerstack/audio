import React from 'react';
import merge from 'deepmerge';
import memoize from 'memoize-one';
import isEqual from 'react-fast-compare';

import { propTypes, defaultProps } from './props.types';
import AudioMediaPlayerSkin from './index';
import { omit } from '../utils';

const IS_BROWSER = typeof window !== 'undefined' && window.document && typeof document !== 'undefined';
const IS_GLOBAL = typeof global !== 'undefined' && global.window && global.window.document;
const SUPPORTED_PROPS = Object.keys(propTypes);

const UniversalSuspense = IS_BROWSER || IS_GLOBAL ? React.Suspense : () => null;

export const createAudioPlayer = (player) => {
  return class AudioPlayer extends React.Component {
    static displayName = 'AudioPlayer';
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    player = null;

    state = {};

    static canPlay = (url) => {
      if (player.canPlay(url)) {
        return true;
      }
      return false;
    };

    references = {
      wrapper: (wrapper) => {
        this.wrapper = wrapper;
      },
      player: (player) => {
        if (player && player !== this.player) {
          this.player = player;
          this.forceUpdate();
        }
      },
    };

    shouldComponentUpdate(nextProps, nextState) {
      return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
    }

    getDuration = () => {
      if (!this.player) return null;
      return this.player.getDuration();
    };

    getCurrentTime = () => {
      if (!this.player) return null;
      return this.player.getCurrentTime();
    };

    getSecondsLoaded = () => {
      if (!this.player) return null;
      return this.player.getSecondsLoaded();
    };

    getInternalPlayer = (key = 'player') => {
      if (!this.player) return null;
      return this.player.getInternalPlayer(key);
    };

    seekTo = (fraction, type, keepPlaying) => {
      if (!this.player) return null;
      this.player.seekTo(fraction, type, keepPlaying);
    };

    handleReady = () => {
      if (this.props.onReady) {
        this.props.onReady(this);
      }
    };

    getActivePlayer = memoize((url) => {
      if (player.canPlay(url)) {
        return player;
      }
      return null;
    });

    getConfig = memoize((_url, key) => {
      const { config } = this.props;
      return merge.all([defaultProps.config, defaultProps.config[key] || {}, config, config[key] || {}]);
    });

    getAttributes = memoize(() => {
      return omit(this.props, SUPPORTED_PROPS);
    });

    getPlayerConfig = memoize((config) => {
      return {
        attributes: config.attributes,
        tracks: config.tracks || [],
        forceHLS: config.forceHLS,
        dashVersion: config.dashVersion,
        forceDASH: config.forceDASH,
        forceFLV: config.forceFLV,
        flvVersion: config.flvVersion,
        forceDisableHls: config.forceDisableHls,
        hlsOptions: config.hlsOptions,
        hlsVersion: config.hlsVersion,
        forceSafariHLS: config.forceSafariHLS,
      };
    });

    renderActivePlayer = (url) => {
      if (!url) return null;

      const activePlayer = this.getActivePlayer(url);
      if (!activePlayer) return null;

      const config = this.getConfig(url, activePlayer.key);
      const playerConfig = this.getPlayerConfig(config);

      return (
        <AudioMediaPlayerSkin
          key={activePlayer.key + '-audio'}
          ref={this.references.player}
          activePlayer={activePlayer.lazyPlayer}
          player={this.player}
          playbackRate={this.props.playbackRate}
          playsinline={this.props.playsinline}
          progressInterval={this.props.progressInterval}
          stopOnUnmount={this.props.stopOnUnmount}
          volume={this.props.volume}
          muted={this.props.muted}
          loop={this.props.loop}
          url={url}
          width={this.props.width}
          playing={this.props.playing}
          waiting={this.props.waiting}
          config={playerConfig}
          language={this.props.language}
          poster={this.props.poster}
          title={this.props.title}
          artist={this.props.artist}
          chapters={this.props.chapters}
          onBuffer={this.props.onBuffer}
          onBufferEnd={this.props.onBufferEnd}
          onDuration={this.props.onDuration}
          onEnded={this.props.onEnded}
          onError={this.props.onError}
          onPause={this.props.onPause}
          onPlay={this.props.onPlay}
          onPlayBackRateChange={this.props.onPlayBackRateChange}
          onProgress={this.props.onProgress}
          onReady={this.handleReady}
          onSeek={this.props.onSeek}
          onStart={this.props.onStart}
          onLoaded={this.props.onLoaded}
          onMount={this.props.onMount}
          onPrevious={this.props.onPrevious}
          onNext={this.props.onNext}
          showNavButtons={this.props.showNavButtons}
          ads={this.props.ads}
        />
      );
    };

    render() {
      const { wrapper: Wrapper } = this.props;
      const url = this.props.url;
      const { className, ...attributes } = this.getAttributes();
      const wrapperRef = typeof Wrapper === 'string' ? this.references.wrapper : undefined;

      return (
        <Wrapper
          ref={wrapperRef}
          data-testid="audio-player"
          className={`playerstack-audio${className ? ` ${className}` : ''}`}
          {...attributes}
        >
          <UniversalSuspense fallback={this.props.fallback}>{this.renderActivePlayer(url)}</UniversalSuspense>
        </Wrapper>
      );
    }
  };
};
