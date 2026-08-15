import { createContext } from 'react';

const initialState = {
  menuVisible: false,
  playerRef: null,
  videoRef: null,
};

const AppContext = createContext({ state: initialState, dispatch: () => null });

export { AppContext, initialState };
