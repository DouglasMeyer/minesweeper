/* globals PeerWeb */
let peerWeb;

// === Reducers
import { SET_PEERS, PEER_CONNECTED, PEER_DISCONNECTED, PEER_UNAVAILABLE } from './actions';
export function reducer(state, action){
  if (!state.peers) state.peers = [];

  function removePeer({ peerId }){
    const { peers } = state;
    const peerIndex = peers.indexOf(peerId);
    if (peerIndex === -1) return state;
    return Object.assign({}, state, {
      peers: [ ...peers.slice(0, peerIndex), ...peers.slice(peerIndex+1) ]
    });
  }
  const r = {
    [SET_PEERS]: ({ peers }) => {
      if (peerWeb) peers.forEach(peerWeb.addPeer);
      return Object.assign({}, state, { peers });
    },
    [PEER_CONNECTED]: ({ peerId }) => {
      if (state.peers.indexOf(peerId) !== -1) return state;
      return Object.assign({}, state, {
        peers: state.peers.concat([ peerId ])
      });
    },
    [PEER_DISCONNECTED]: removePeer,
    [PEER_UNAVAILABLE]: removePeer
  }[action.type];
  if (r) return r(action);
  return state;
}


// === Components
import { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { peerOpen, peerConnected, peerDisconnected, setMapSeed, peerUnavailable, setPeers } from './actions';
class PeerIntegration extends Component {
  static get propTypes(){
    return {
      gameMode: PropTypes.string.isRequired,
      peers: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
      mapSeed: PropTypes.string,
      onPeerOpen: PropTypes.func.isRequired,
      onPeerConnected: PropTypes.func.isRequired,
      onPeerDisconnected: PropTypes.func.isRequired,
      onPeerUnavailable: PropTypes.func.isRequired,
      onSetPeers: PropTypes.func.isRequired
    };
  }

  shouldComponentUpdate(nextProps, _nextState){
    return this.props !== nextProps;
  }

  render(){
    const {
      gameMode, peers, mapSeed,
      onPeerOpen, onPeerConnected, onPeerDisconnected, onPeerUnavailable, onSetPeers
    } = this.props;

    if (gameMode === 'cooperative' && !peerWeb){
      peerWeb = new PeerWeb.default('p6zcgijuvfclq5mi');
      peerWeb.onOpen(peerId => {
        onPeerOpen(peerId);
        peers.forEach(peerWeb.addPeer);
        onSetPeers(peers.concat(peerId));
      });
      peerWeb.onConnected(peerId => {
        onPeerConnected(peerId);
        peerWeb.send(setMapSeed(mapSeed));
      });
      peerWeb.onDisconnected(onPeerDisconnected);
      peerWeb.onClose(console.log.bind(console, 'onClose'));
      peerWeb.onData(console.log.bind(console, 'onData'));
      peerWeb.onUnavailable(onPeerUnavailable);
    }

    return false;
  }
}
const connectedPeerIntegration = connect(
  state => ({
    gameMode: state.info.gameMode,
    mapSeed: state.info.mapSeed,
    peers: state.peers
  }),
  dispatch => ({
    onPeerOpen: peerId => dispatch(peerOpen(peerId)),
    onPeerConnected: peerId => dispatch(peerConnected(peerId)),
    onPeerDisconnected: peerId => dispatch(peerDisconnected(peerId)),
    onPeerUnavailable: peerId => dispatch(peerUnavailable(peerId)),
    onSetPeers: peers => dispatch(setPeers(peers))
  })
)(PeerIntegration);
export {
  connectedPeerIntegration as PeerIntegration
};
