import { combineReducers } from 'redux';

import field from './field';
import tracking from './tracking';

export default combineReducers({
  field, tracking
});
