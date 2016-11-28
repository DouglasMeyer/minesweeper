// Reducers
import { default as fields, init as fieldsInit } from './fields';
import { default as tracking, init as trackingInit } from './tracking';
import { default as info, init as infoInit } from './info';

import { NEW_GAME } from '../actions';

export default function reducer(state, action){
  let newState = state;
  if (!state || action.type === NEW_GAME) {
    let info = infoInit();
    newState = {
      info: info,
      tracking: trackingInit(),
      fields: fieldsInit(info.seed)
    };
  }
  const isGameOver = newState.info.isGameOver;
  const seed = newState.info.seed;

  if (!isGameOver){
    const newFieldsState = fields(newState.fields, action, seed);
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
