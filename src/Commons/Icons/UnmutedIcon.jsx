import React from 'react';
import { compareProps, propTypes } from './Icons.constants';

const UnmutedIcon = ({ width = 36, height = 36 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path d="M 22.5 18 C 22.5 16.189 21.48 14.624 20 13.87 L 20 22.136 C 21.48 21.377 22.5 19.812 22.5 18 Z"></path>
      <polygon points="9 14.922 9 21.078 13 21.078 18 26.21 18 9.79 13 14.922"></polygon>
      <path d="M 20 9 L 20 11.119 C 22.89 12.002 25 14.747 25 18 C 25 21.253 22.89 23.999 20 24.881 L 20 27 C 24.005 26.066 27 22.398 27 18 C 27 13.603 24.005 9.934 20 9 Z"></path>
    </svg>
  );
};

UnmutedIcon.displayName = 'UnmutedIcon';

UnmutedIcon.propTypes = propTypes;

export default React.memo(UnmutedIcon, compareProps);
