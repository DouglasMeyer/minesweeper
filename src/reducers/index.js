import { combineReducers } from 'redux';

import fields from './fields';
import tracking from './tracking';

export default combineReducers({
  fields, tracking
});
