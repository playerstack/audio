// Mock for @playerstack/core
module.exports = {
  formatTime: (seconds) => {
    if (!seconds || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + String(secs).padStart(2, "0");
  },
  canPlay: () => true,
  isMediaStream: () => false,
  isBlobUrl: () => false,
  isAudioUrl: () => true,
  indexBy: (arr, key) => arr.reduce((acc, item) => { acc[item[key]] = item; return acc; }, {}),
  omit: (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k))),
  en: { play: "Play", pause: "Pause", mute: "Mute", unmute: "Unmute", settings: "Settings", speed: "Speed", normal: "Normal", skipBack: "Skip back", skipForward: "Skip forward", replay: "Replay", skipAd: "Skip ad" },
  es: { play: "Reproducir", pause: "Pausar", mute: "Silenciar", unmute: "Activar sonido", settings: "Configuración", speed: "Velocidad", normal: "Normal", skipBack: "Retroceder", skipForward: "Avanzar", replay: "Repetir", skipAd: "Omitir anuncio" },
  IS_IOS: false,
  IS_SAFARI: false,
  HLS_SDK_URL: "https://cdn.jsdelivr.net/npm/hls.js@VERSION/dist/hls.min.js",
  HLS_GLOBAL: "Hls",
  DASH_SDK_URL: "https://cdn.jsdelivr.net/npm/dashjs@VERSION/dist/dash.all.min.js",
  DASH_GLOBAL: "dashjs",
  FLV_SDK_URL: "https://cdn.jsdelivr.net/npm/flv.js@VERSION/dist/flv.min.js",
  FLV_GLOBAL: "flvjs",
  HLS_EXTENSIONS: /\.(m3u8)($|\?)/i,
  DASH_EXTENSIONS: /\.(mpd)($|\?)/i,
  FLV_EXTENSIONS: /\.(flv)($|\?)/i,
  getGlobal: () => null,
  getSDK: () => Promise.resolve({}),
  hasAudio: () => true,
  supportsWebKitPresentationMode: () => false,
  getCookie: () => null,
  setCookie: () => {},
};
