import React from 'react';
import { StyledAudioWrapper } from '@AudioMediaPlayer/AudioMediaPlayer.styled';

/**
 * AudioPlayerWrapper provides a styled container for the audio player.
 * CSS resets are applied via styled-components scoped rules (no Shadow DOM).
 */
const AudioPlayerWrapper = React.forwardRef(({ children, ...props }, ref) => {
  return (
    <StyledAudioWrapper ref={ref} {...props}>
      {children}
    </StyledAudioWrapper>
  );
});

AudioPlayerWrapper.displayName = 'AudioPlayerWrapper';

export default AudioPlayerWrapper;
