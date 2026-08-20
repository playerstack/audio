import { canPlay } from '@playerstack/core';
import { lazy } from '@hooks/utils/lazy';
import { createAudioPlayer } from '@AudioMediaPlayer/createAudioPlayer';

const playerCore = {
  key: 'core',
  name: 'AudioElement',
  canPlay,
  lazyPlayer: lazy(() => import('@core/AudioElement')),
};

export default createAudioPlayer(playerCore);
