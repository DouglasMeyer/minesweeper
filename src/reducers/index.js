// Reducers
import fields from './fields';
import tracking from './tracking';
import info from './info';

import { NEW_GAME } from '../actions';

export default function reducer(state = {}, action){
  let newState = state;
  if (action.type === NEW_GAME) newState = {};
  const isGameOver = newState.info && newState.info.isGameOver;

  if (!isGameOver){
    const newFieldsState = fields(newState.fields, action);
    if (newFieldsState !== newState.fields){
      newState = Object.assign({}, newState, { fields: newFieldsState });
    }
  }

  const newTrackingState = tracking(newState.tracking, action);
  if (newTrackingState !== newState.tracking){
    newState = Object.assign({}, newState, { tracking: newTrackingState });
  }

  if (!isGameOver) newState = info(newState, action);

  return newState;
}
