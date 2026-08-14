import { canPlay } from '@playerstack/core';
import { lazy } from '../utils/player';

export default {
  key: 'core',
  name: 'PlayerCore',
  canPlay: canPlay,
  lazyPlayer: lazy(() => import('./PlayerCore')),
};
