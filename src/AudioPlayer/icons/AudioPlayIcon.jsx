import React from 'react';

const AudioPlayIcon = ({ width = 36, height = 36 }) => {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width={width} height={height}>
      <path
        d="M13 10.15C13 9.5 13.72 9.1 14.27 9.46L25.97 17.31C26.46 17.64 26.46 18.36 25.97 18.69L14.27 26.54C13.72 26.9 13 26.5 13 25.85V10.15Z"
        fill="currentColor"
      />
    </svg>
  );
};

AudioPlayIcon.displayName = 'AudioPlayIcon';

export default React.memo(AudioPlayIcon);
