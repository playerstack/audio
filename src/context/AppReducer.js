import { actionTypes } from './AppReducer.constants';

function reducer(state, action) {
  try {
    if (!state || !action) {
      throw new Error('Reducer params has not been provided!');
    }

    // Support function actions (like useState updater pattern)
    if (typeof action === 'function') {
      const resolvedAction = action(state);
      if (!resolvedAction || typeof resolvedAction !== 'object') {
        return state;
      }
      return reducer(state, resolvedAction);
    }

    if ('type' in action) {
      const { type, payload } = action;

      if (actionTypes.includes(type) === false) {
        throw new Error(`Invalid type "${type}" in action payload!`);
      }

      // Bail out if value hasn't changed to prevent unnecessary re-renders
      if (state[type] === payload) {
        return state;
      }

      return {
        ...state,
        [type]: payload,
      };
    } else if (typeof action === 'object') {
      if (Object.keys(action).length === 0) {
        throw new Error('Reducer action object is empty!');
      }

      let hasChanged = false;
      let newState = {
        ...state,
      };

      for (const key in action) {
        const value = action[key];
        if (actionTypes.includes(key) === false) {
          throw new Error(`Invalid type "${key}" in action object!`);
        }

        if (state[key] !== value) {
          hasChanged = true;
          newState = {
            ...newState,
            [key]: value,
          };
        }
      }

      // Return same reference if nothing changed
      return hasChanged ? newState : state;
    }

    return state;
  } catch (error) {
    console.error('Error in AppReducer: ', error);
    return state;
  }
}

export { actionTypes, reducer };
