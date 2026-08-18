// Mock for @playerstack/core
module.exports = {
  // Utils
  formatTime: (seconds) => {
    if (!seconds || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + String(secs).padStart(2, '0');
  },
  omit: (obj, ...keysOrArrays) => {
    const keys = [];
    for (const arg of keysOrArrays) {
      if (Array.isArray(arg)) keys.push(...arg);
      else keys.push(arg);
    }
    return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
  },
  indexBy: (arr, key) => arr.reduce((acc, item) => { acc[item[key]] = item; return acc; }, {}),
  isMediaStream: () => false,
  isBlobUrl: () => false,
  getCookie: () => null,
  setCookie: () => {},

  // Patterns
  canPlay: () => true,
  isAudioUrl: () => true,
  HLS_EXTENSIONS: /\.(m3u8)($|\?)/i,
  DASH_EXTENSIONS: /\.(mpd)($|\?)/i,
  FLV_EXTENSIONS: /\.(flv)($|\?)/i,

  // Constants
  IS_IOS: false,
  IS_SAFARI: false,
  HLS_SDK_URL: 'https://cdn.jsdelivr.net/npm/hls.js@VERSION/dist/hls.min.js',
  HLS_GLOBAL: 'Hls',
  DASH_SDK_URL: 'https://cdn.jsdelivr.net/npm/dashjs@VERSION/dist/dash.all.min.js',
  DASH_GLOBAL: 'dashjs',
  FLV_SDK_URL: 'https://cdn.jsdelivr.net/npm/flv.js@VERSION/dist/flv.min.js',
  FLV_GLOBAL: 'flvjs',

  // SDK
  getGlobal: () => null,
  getSDK: () => Promise.resolve({}),
  hasAudio: () => true,
  supportsWebKitPresentationMode: () => false,

  // Default config constants
  DEFAULT_PROGRESS_INTERVAL: 1000,
  defaultMediaConfig: {
    forceHLS: false,
    forceDASH: false,
    forceFLV: false,
    hlsOptions: {},
    hlsVersion: '1.5.7',
    dashVersion: '4.7.4',
    flvVersion: '1.6.2',
    forceDisableHls: false,
  },

  // i18n
  en: { play: 'Play', pause: 'Pause', mute: 'Mute', unmute: 'Unmute', settings: 'Settings', speed: 'Speed', normal: 'Normal', skipBack: 'Skip back', skipForward: 'Skip forward', replay: 'Replay', skipAd: 'Skip ad' },
  es: { play: 'Reproducir', pause: 'Pausar', mute: 'Silenciar', unmute: 'Activar sonido', settings: 'Configuración', speed: 'Velocidad', normal: 'Normal', skipBack: 'Retroceder', skipForward: 'Avanzar', replay: 'Repetir', skipAd: 'Omitir anuncio' },
  getTranslations: (language) => {
    const translations = {
      en: { play: 'Play', pause: 'Pause', mute: 'Mute', unmute: 'Unmute', settings: 'Settings', speed: 'Speed', normal: 'Normal', skipBack: 'Skip back', skipForward: 'Skip forward', replay: 'Replay', skipAd: 'Skip ad' },
      es: { play: 'Reproducir', pause: 'Pausar', mute: 'Silenciar', unmute: 'Activar sonido', settings: 'Configuración', speed: 'Velocidad', normal: 'Normal', skipBack: 'Retroceder', skipForward: 'Avanzar', replay: 'Repetir', skipAd: 'Omitir anuncio' },
    };
    return translations[language] || translations.en;
  },

  // Player State
  playerStateInitial: {
    kernelError: null,
    seeking: false,
    seek: 0,
    played: 0,
    loaded: 0,
    duration: 0,
    isFullScreen: false,
    isEnded: false,
    isPIP: false,
    isLoading: true,
    isBuffering: false,
    volume: 0.8,
    playbackRate: 1,
    playbackQuality: null,
    videoUrl: null,
    hasAudio: true,
    loop: false,
    playing: false,
    isMuted: false,
    activeCaption: null,
  },
  reduceSeekState: (prev, seeking) => ({ ...prev, seeking, isEnded: false, playing: seeking ? prev.playing : true }),

  // Audio Player State (subset)
  audioPlayerStateInitial: {
    kernelError: null,
    seeking: false,
    seek: 0,
    played: 0,
    loaded: 0,
    duration: 0,
    isEnded: false,
    isLoading: true,
    isBuffering: false,
    volume: 0.8,
    playbackRate: 1,
    hasAudio: true,
    loop: false,
    playing: false,
    isMuted: false,
  },

  // Chapters
  computeChapterSegments: (chapters, duration) => {
    if (!chapters || chapters.length === 0 || duration <= 0) return [];
    const sorted = [...chapters].filter((c) => c.startTime < duration).sort((a, b) => a.startTime - b.startTime);
    return sorted.map((chapter, index) => {
      const endTime = index < sorted.length - 1 ? sorted[index + 1].startTime : duration;
      return {
        title: chapter.title,
        startTime: chapter.startTime,
        endTime: Math.min(endTime, duration),
        startPercent: (chapter.startTime / duration) * 100,
        endPercent: (Math.min(endTime, duration) / duration) * 100,
      };
    });
  },
  getChapterAtTime: (segments, time) => {
    if (segments.length === 0) return null;
    for (let i = segments.length - 1; i >= 0; i--) {
      if (time >= segments[i].startTime) return segments[i];
    }
    return segments[0];
  },

  // Slider
  getEventXCoordinate: (event) => event.clientX || 0,
  getTimeFromSliderPosition: (clientX, rect, duration) => {
    const w = clientX - rect.left;
    if (w <= 0) return 0;
    if (w >= rect.width) return duration;
    return Math.round((duration * w) / rect.width);
  },

  // UI
  buildIconProps: (isFullscreen) => isFullscreen ? { width: 54, height: 54 } : { width: 36, height: 36 },

  // Reducer
  createTypedReducer: (validTypes) => (state, action) => {
    if (!state || !action) return state;
    if (typeof action === 'function') {
      const resolved = action(state);
      if (!resolved || typeof resolved !== 'object') return state;
      return { ...state, ...resolved };
    }
    if ('type' in action) {
      if (!validTypes.includes(action.type)) return state;
      if (state[action.type] === action.payload) return state;
      return { ...state, [action.type]: action.payload };
    }
    if (typeof action === 'object') {
      let changed = false;
      const next = { ...state };
      for (const key in action) {
        if (!validTypes.includes(key)) continue;
        if (state[key] !== action[key]) { changed = true; next[key] = action[key]; }
      }
      return changed ? next : state;
    }
    return state;
  },
};
