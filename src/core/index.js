import { canPlay } from '@playerstack/core';
import { lazy } from '@playerstack/core/hooks';

export default {
  key: 'core',
  name: 'PlayerCore',
  canPlay,
  lazyPlayer: lazy(() => import('./PlayerCore')),
};
