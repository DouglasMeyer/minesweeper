/* globals PeerWeb */
let peerWeb;

// === Reducers
import {
  PEER_OPEN, SET_PEERS, PEER_CONNECTED, PEER_DISCONNECTED, PEER_UNAVAILABLE,
  REVEAL, FLAG, UNFLAG, SET_GAME_SEEDS,
  newGame
} from './actions';
import { fieldSize } from './helpers';
export function reducer(state, action){
  if (!state.peers) state.peers = [];

  function addPeer({ peerId }){
    if (state.peers.indexOf(peerId) !== -1) return state;
    return Object.assign({}, state, {
      peers: state.peers.concat([ peerId ])
    });
  }
  function removePeer({ peerId }){
    const { peers } = state;
    const peerIndex = peers.indexOf(peerId);
    if (peerIndex === -1) return state;
    return Object.assign({}, state, {
      peers: [ ...peers.slice(0, peerIndex), ...peers.slice(peerIndex+1) ]
    });
  }
  function shareWithPeers({ peer }){
    if (peerWeb && !peer) peerWeb.send(Object.assign({}, action, { peer: peerWeb.peer.id }));
    return state;
  }
  const r = {
    [PEER_OPEN]: addPeer,
    [SET_PEERS]: ({ peers }) => {
      if (peerWeb) peers.forEach(peerWeb.addPeer);
      return Object.assign({}, state, { peers });
    },
    [PEER_CONNECTED]: addPeer,
    [PEER_DISCONNECTED]: removePeer,
    [PEER_UNAVAILABLE]: removePeer,
    [REVEAL]: shareWithPeers,
    [FLAG]: shareWithPeers,
    [UNFLAG]: shareWithPeers,
    [SET_GAME_SEEDS]: () => {
      const { info: { nextGames, currentGame: { reveals } } } = state;
      if (nextGames.length === 1 && Object.keys(reveals).length === 1) {
        peerWeb.send({ type: NEW_MAP,  });
      }
    }
  }[action.type];
  if (r) return r(action);
  return state;
}


// === Components
import { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { peerOpen, peerConnected, peerDisconnected, peerUnavailable } from './actions';
class PeerIntegration extends Component {
  static get propTypes(){
    return {
      currentGame: PropTypes.shape({
        gameMode: PropTypes.oneOf('normal learning cooperative'.split(' ')),
        safeStart: PropTypes.bool,
        seed: PropTypes.string.isRequired
      }).isRequired,
      nextGames: PropTypes.arrayOf(
        PropTypes.shape({
          gameMode: PropTypes.oneOf('normal learning cooperative'.split(' ')),
          safeStart: PropTypes.bool,
          seed: PropTypes.string.isRequired
        }).isRequired
      ).isRequired,
      peers: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
      fields: PropTypes.array.isRequired,
      onPeerOpen: PropTypes.func.isRequired,
      onPeerConnected: PropTypes.func.isRequired,
      onPeerDisconnected: PropTypes.func.isRequired,
      onPeerUnavailable: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired
    };
  }

  constructor(){
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render(){
    const {
      currentGame: { gameMode }, peers,
      onPeerOpen, onPeerConnected, onPeerDisconnected, onPeerUnavailable,
      dispatch
    } = this.props;

    if (gameMode === 'cooperative' && !peerWeb){
      peerWeb = new PeerWeb.default('p6zcgijuvfclq5mi');
      peerWeb.onOpen(peerId => {
        onPeerOpen(peerId);
        peers.forEach(peerWeb.addPeer);
      });
      peerWeb.onConnected(peerId => {
        const { currentGame, nextGames, fields, peers } = this.props;
        onPeerConnected(peerId);
        if (peers.indexOf(peerId) !== -1) return;
        const positionsToReveal = fields
          .filter(f=>f.loaded)
          .map(({ cells, position: { x, y } }) =>
            cells
              .map(({revealed}, index) => (
                { revealed,
                  x: x * fieldSize + (index % fieldSize),
                  y: y * fieldSize + Math.floor(index / fieldSize)
                }
              ))
              .filter(c=>c.revealed)
          )
          .reduce((a,b)=>a.concat(b));
        const positionsToFlag = fields
          .filter(f=>f.loaded)
          .map(({ cells, position: { x, y } }) =>
            cells
              .map(({flagged}, index) => (
                { flagged,
                  x: x * fieldSize + (index % fieldSize),
                  y: y * fieldSize + Math.floor(index / fieldSize)
                }
              ))
              .filter(c=>c.flagged)
          )
          .reduce((a,b)=>a.concat(b));
        peerWeb.send(newGame({ currentGame, nextGames, positionsToReveal, positionsToFlag }));
      });
      peerWeb.onDisconnected(onPeerDisconnected);
      peerWeb.onClose(console.log.bind(console, 'onClose')); // eslint-disable-line no-console
      peerWeb.onData(dispatch);
      peerWeb.onUnavailable(onPeerUnavailable);
    }

    return false;
  }
}
const connectedPeerIntegration = connect(
  ({
    info: { currentGame, nextGames },
    peers, fields
  }) => ({
    currentGame,
    nextGames,
    peers,
    fields
  }),
  dispatch => ({
    onPeerOpen: peerId => dispatch(peerOpen(peerId)),
    onPeerConnected: peerId => dispatch(peerConnected(peerId)),
    onPeerDisconnected: peerId => dispatch(peerDisconnected(peerId)),
    onPeerUnavailable: peerId => dispatch(peerUnavailable(peerId)),
    dispatch
  })
)(PeerIntegration);
export {
  connectedPeerIntegration as PeerIntegration
};
