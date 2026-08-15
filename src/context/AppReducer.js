import { createTypedReducer } from '@playerstack/core';
import { actionTypes } from './AppReducer.constants';

const reducer = createTypedReducer(actionTypes);

export { actionTypes, reducer };
