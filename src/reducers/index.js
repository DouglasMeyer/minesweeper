// Reducers
import fields from './fields';
import tracking from './tracking';
import info from './info';

export default
  [ info
  , tracking
  , fields
  ]
  .reverse()
  .reduce((a,b) => (state, action) => a(b(state, action), action));
