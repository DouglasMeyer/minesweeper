/* globals location */

// === Components
import { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { setSafeStart, setGameMode, setNextGameMode, setNextSafeStart, setPeers } from './actions';

function encode(options, ...peers){
  const shouldShowPeers = peers.length && options.gameMode === 'cooperative';
  const query = shouldShowPeers ? Object.assign({}, options, { peers }) : options;
  return Object.keys(query)
    .filter(k => query[k] && !(k === 'gameMode' && query[k] === 'normal'))
    .map(k => query[k] === true ? k :
      Array.isArray(query[k]) ? query[k].map(v=> `${k}[]=${v}`).join(',') :
      `${k}=${query[k]}`
    )
    .join(',');
}

function decode(hash){
  return hash
    .slice(1)
    .split(',')
    .reduce((hash,str) => {
      const [ key, value ] = str.split("=");
      const trueValue = value === undefined ? true : value;
      if (key === '') return hash;
      const arrayParam = key.match(/^(.+)\[(\d*)\]/);
      if (arrayParam){
        const [_match, arrayKey, arrayIndex] = arrayParam;
        if (!hash[arrayKey]) hash[arrayKey] = [];
        if (arrayIndex) hash[arrayKey][arrayIndex] = trueValue;
        else hash[arrayKey].push(trueValue);
      } else {
        hash[key] = trueValue;
      }
      return hash;
    }, {
      gameMode: 'normal',
      safeStart: false,
      peers: []
    });
}

class Routing extends Component {
  static get propTypes(){
    return {
      safeStart: PropTypes.bool,
      gameMode: PropTypes.oneOf('normal learning cooperative'.split(' ')),
      peers: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
      onSetGameMode: PropTypes.func.isRequired,
      onSetSafeStart: PropTypes.func.isRequired,
      onSetNextGameMode: PropTypes.func.isRequired,
      onSetNextSafeStart: PropTypes.func.isRequired,
      onSetPeers: PropTypes.func.isRequired
    };
  }

  constructor(){
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentWillMount(){
    const {
      onSetGameMode, onSetSafeStart, onSetNextGameMode, onSetNextSafeStart, onSetPeers
    } = this.props;

    const hashOptions = decode(location.hash);

    onSetGameMode(hashOptions.gameMode);
    onSetSafeStart(hashOptions.safeStart);
    onSetNextGameMode(hashOptions.gameMode);
    onSetNextSafeStart(hashOptions.safeStart);
    onSetPeers(hashOptions.peers);

    window.addEventListener('hashchange', ()=>{
      const {
        gameMode, safeStart, peers
      } = this.props;
      const hashOptions = decode(location.hash);
      const hash = encode({ gameMode: hashOptions.gameMode, safeStart: hashOptions.safeStart }, ...hashOptions.peers);
      if (hash !== location.hash) location.hash = hash;

      if (hashOptions.gameMode !== gameMode) onSetNextGameMode(hashOptions.gameMode);
      if (hashOptions.safeStart !== safeStart) onSetNextSafeStart(hashOptions.safeStart);
      if (hashOptions.peers.join(',') !== peers.join(',')) onSetPeers(hashOptions.peers);
    });
  }

  render(){
    const {
      gameMode, safeStart, peers
    } = this.props;

    location.hash = encode({ gameMode, safeStart }, ...peers);

    return false;
  }
}
const connectedRouting = connect(
  ({ peers, info }) => {
    const { safeStart, gameMode } = info.nextGames.slice(-1)[0];
    return { safeStart, gameMode, peers };
  },
  dispatch => ({
    onSetPeers: peers => dispatch(setPeers(peers)),
    onSetGameMode: gameMode => dispatch(setGameMode(gameMode)),
    onSetSafeStart: safeStart => dispatch(setSafeStart(safeStart)),
    onSetNextGameMode: gameMode => dispatch(setNextGameMode(gameMode)),
    onSetNextSafeStart: safeStart => dispatch(setNextSafeStart(safeStart))
  })
)(Routing);
export {
  connectedRouting as Routing
};
