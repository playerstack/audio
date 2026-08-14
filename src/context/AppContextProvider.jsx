import React from 'react';

import { reducer } from './AppReducer';
import { initialState, AppContext } from './AppContext';
import { en, es } from '@playerstack/core';

const i18n = { en, es };

const AppContextProvider = ({ children, language }) => {
  const [state, dispatch] = React.useReducer(reducer, {
    ...initialState,
    i18n: i18n[language],
  });

  const context = React.useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};

export { AppContextProvider };
