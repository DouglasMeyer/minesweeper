import { combineReducers } from 'redux';

import fields from './fields';
import tracking from './tracking';
import info from './info';

const combinedReducers =  combineReducers({
  fields, tracking,
  info: (s = {}) => s
});

export default function reducer(state = {}, action){
  return combinedReducers(info(state, action), action);
};
