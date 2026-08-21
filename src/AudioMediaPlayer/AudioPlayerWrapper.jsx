import React from 'react';

import { ensureAudioWrapperStyles } from '@AudioMediaPlayer/wrapperStyles';

/**
 * `AudioPlayerWrapper` provides the light-DOM container that positions the audio player.
 *
 * Since task 15.2 the former `styled-components` `StyledAudioWrapper` is replaced by a plain
 * `<div class="playerstack-audio-wrapper">` whose CSS is injected once into `document.head`
 * via `ensureAudioWrapperStyles` (see `wrapperStyles.js`). Core's `:host`-scoped CSS cannot
 * reach this audio-owned light-DOM wrapper, so the wrapper/reset styles live here — the
 * consumer still imports no CSS (Style_Auto_Injection philosophy for the light DOM).
 */
const AudioPlayerWrapper = React.forwardRef(({ children, className, ...props }, ref) => {
  // Inject the light-DOM wrapper stylesheet once, in an effect (never during render, R3).
  React.useEffect(() => {
    ensureAudioWrapperStyles();
  }, []);

  const composedClassName = className ? `playerstack-audio-wrapper ${className}` : 'playerstack-audio-wrapper';

  return (
    <div ref={ref} className={composedClassName} {...props}>
      {children}
    </div>
  );
});

AudioPlayerWrapper.displayName = 'AudioPlayerWrapper';

export default AudioPlayerWrapper;
