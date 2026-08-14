import { createContext } from 'react';

const initialState = {
  captionDragging: false,
  contextMenuVisible: false,
  controlsHovering: false,
  timeSliding: false,
  volumeSliding: false,
  hiding: false,
  menuVisible: false,
  subMenuVisible: false,
  fullscreen: false,
  playerRef: null,
  videoRef: null,
};

const AppContext = createContext({ state: initialState, dispatch: () => null });

export { AppContext, initialState };
