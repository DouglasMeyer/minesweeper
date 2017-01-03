// Reducers
import fields from './fields';
import tracking from './tracking';
import info from './info';
import { reducer as peerIntegration } from '../peer_integration';

export default
  [ info
  , tracking
  , fields
  , peerIntegration
  ]
  .reverse()
  .reduce((a,b) => (state, action) => a(b(state, action), action));
