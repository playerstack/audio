<h1 align="center">
  Player Stack — Audio
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@playerstack/audio"><img src="https://img.shields.io/npm/v/@playerstack/audio.svg" alt="Latest npm version"></a>
  <a href="https://codecov.io/gh/playerstack/audio"><img src="https://img.shields.io/codecov/c/github/playerstack/audio.svg" alt="Test Coverage"></a>
  <a href="https://www.patreon.com/soyvillareal"><img src="https://img.shields.io/badge/sponsor-patreon-fa6854.svg" alt="Become a sponsor on Patreon"></a>
</p>

<p align="center">
  A React component for playing audio with HLS, DASH and native media formats.
</p>

---

### Usage

```bash
npm install @playerstack/audio # or yarn add @playerstack/audio
```

```jsx
import React from "react";
import AudioPlayer from "@playerstack/audio";

// Render an audio player
<AudioPlayer url="https://example.com/audio.mp3" title="My Song" artist="Artist Name" />;
```

### Props

| Prop | Description | Default |
|------|-------------|---------|
| \`url\` | The url of an audio file to play | |
| \`playing\` | Set to \`true\` or \`false\` to pause or play | \`false\` |
| \`loop\` | Set to \`true\` to loop the audio | \`false\` |
| \`volume\` | Set volume between \`0\` and \`1\` | \`null\` |
| \`muted\` | Mutes the player | \`false\` |
| \`playbackRate\` | Set the playback rate | \`1\` |
| \`width\` | Set the width of the player | \`100%\` |
| \`progressInterval\` | Time between onProgress callbacks (ms) | \`1000\` |
| \`playsinline\` | Applies playsinline attribute | \`false\` |
| \`stopOnUnmount\` | Stop playback when component unmounts | \`true\` |
| \`title\` | Title displayed in the audio player | \`""\` |
| \`artist\` | Artist name displayed in the player | \`""\` |
| \`chapters\` | Array of \`{ title, startTime }\` objects | \`[]\` |
| \`config\` | Override options for the player engine | |

#### Callback props

| Prop | Description |
|------|-------------|
| \`onReady\` | Called when media is loaded and ready to play |
| \`onStart\` | Called when media starts playing |
| \`onPlay\` | Called when media starts or resumes playing |
| \`onProgress\` | Callback with played/loaded progress |
| \`onDuration\` | Callback with duration in seconds |
| \`onPause\` | Called when media is paused |
| \`onBuffer\` | Called when media starts buffering |
| \`onBufferEnd\` | Called when media has finished buffering |
| \`onSeek\` | Called when media seeks |
| \`onPlayBackRateChange\` | Called when playback rate changes |
| \`onEnded\` | Called when media finishes playing |
| \`onError\` | Called when an error occurs |

### Instance Methods

Use \`ref\` to call instance methods on the player.

| Method | Description |
|--------|-------------|
| \`seekTo(amount, type)\` | Seek to a position |
| \`getCurrentTime()\` | Returns seconds played |
| \`getSecondsLoaded()\` | Returns seconds loaded |
| \`getDuration()\` | Returns duration in seconds |
| \`getInternalPlayer()\` | Returns the internal player |

### Supported formats

- Native audio files (\`.mp3\`, \`.wav\`, \`.ogg\`, \`.aac\`, \`.m4a\`, \`.flac\`, \`.webm\`)
- HLS streams (\`.m3u8\`) via [hls.js](https://github.com/video-dev/hls.js)
- DASH streams (\`.mpd\`) via [dash.js](https://github.com/Dash-Industry-Forum/dash.js)
- FLV streams (\`.flv\`) via [flv.js](https://github.com/bilibili/flv.js)

### Contributing

See the [contribution guidelines](https://github.com/playerstack/audio/blob/main/CONTRIBUTING.md) before creating a pull request.

### Thanks

- Thanks to anyone who has [contributed](https://github.com/playerstack/audio/graphs/contributors).
- Big thanks to my [Patreon](https://patreon.com/soyvillareal) supporters!
