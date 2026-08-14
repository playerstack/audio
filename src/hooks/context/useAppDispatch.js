import React from 'react';

import { AppContext } from '../../context/AppContext';

const useAppDispatch = () => {
  const { state, dispatch } = React.useContext(AppContext);

  // Keep a stable ref to state so enhancedDispatch identity doesn't change
  // on every state update. Without this, any component using dispatch in a
  // useCallback/useEffect dep array would re-render on every state change,
  // causing infinite render loops.
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const enhancedDispatch = React.useCallback(
    (action) => {
      if (typeof action === 'function') {
        const resolvedAction = action(stateRef.current);
        dispatch(resolvedAction);
      } else {
        dispatch(action);
      }
    },
    [dispatch],
  );

  return enhancedDispatch;
};

export default useAppDispatch;
