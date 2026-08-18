import { createPlayerContext } from '@playerstack/core/hooks';
import { getTranslations } from '@playerstack/core';

const actionTypes = ['i18n', 'menuVisible', 'videoRef', 'playerRef'];

const initialState = {
  i18n: {},
  menuVisible: false,
  videoRef: null,
  playerRef: null,
};

const { Context, Provider, useSelector, useDispatch } = createPlayerContext({
  actionTypes,
  initialState,
  getTranslationsFn: getTranslations,
});

// Export hooks with app-specific names so consumers import without aliases
const useAppSelector = useSelector;
const useAppDispatch = useDispatch;

export { Context, Provider, useAppSelector, useAppDispatch, actionTypes, initialState };
