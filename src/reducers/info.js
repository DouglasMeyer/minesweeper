/* eslint-env browser */
import { REVEAL, NEW_GAME, SET_GAME_MODE, SET_SAFE_START, SET_NEXT_GAME_MODE, SET_NEXT_SAFE_START, PEER_OPEN } from '../actions';
import { cellAt } from '../helpers';

const bestHardcoreKey = 'minesweeper.bestHardcore';

const newSeed = Math.seedrandom.bind(null, null, { pass: (_prng, seed)=> seed });

function newGame({
  gameMode = 'normal',
  safeStart = false,
  reveals = [],
  seed
}={}){
  return {
    gameMode,
    safeStart,
    reveals,
    seed: seed || newSeed()
  };
}

function init(){
  let bestHardcore = localStorage.getItem(bestHardcoreKey);
  if (bestHardcore) bestHardcore = parseInt(bestHardcore, 10);
  return {
    bestHardcore,
    peerId: 'solo',
    previousGames: [],
    currentGame: newGame(),
    nextGame: newGame()
  };
}

export default function info(_state, action){
  const state = (_state && _state.info) ? _state : Object.assign({}, _state, { info: init() });

  const r = {
    [NEW_GAME]: ({ currentGame = state.info.nextGame, nextGame })=>{
      const previousGames = state.info.previousGames.concat([ state.info.currentGame ]);
      return Object.assign({}, state, {
        info: Object.assign({}, state.info, {
          previousGames,
          currentGame,
          nextGame: nextGame || newGame(Object.assign({}, currentGame, { seed: null }))
        })
      });
    },
    [PEER_OPEN]: peerId => Object.assign({}, state, { info: Object.assign({}, state.info, { peerId }) }),
    [REVEAL]: ()=> {
      if (
        action.seed !== state.info.currentGame.seed
      ) return state;
      const { fields, info: { peerId } } = state;
      const newInfo = action.positions.reduce((info, pos) => {
        const isHardcore = info.currentGame.gameMode !== 'learning';
        const cell = cellAt(fields, pos.x, pos.y);
        const isMine = cell.mine;
        const reveals = [ Object.assign({}, pos, { peerId, isMine }), ...info.currentGame.reveals ];
        let bestHardcore = info.bestHardcore;
        if (isHardcore && reveals.length > bestHardcore) {
          bestHardcore = reveals.length;
          try {
            localStorage.setItem(bestHardcoreKey, bestHardcore);
          } catch (e) { console.error(e); } // eslint-disable-line no-console
        }
        return Object.assign({}, info, {
          bestHardcore,
          currentGame: Object.assign({}, info.currentGame, { reveals })
        });
      }, state.info);
      return Object.assign({}, state, { info: newInfo });
    },
    [SET_GAME_MODE]: ({ gameMode }) => Object.assign({}, state, { info: Object.assign({}, state.info, {
      currentGame: Object.assign({}, state.info.currentGame, { gameMode })
    }) }),
    [SET_SAFE_START]: ({ safeStart }) => Object.assign({}, state, { info: Object.assign({}, state.info, {
      currentGame: Object.assign({}, state.info.currentGame, { safeStart })
    }) }),
    [SET_NEXT_GAME_MODE]: ({ gameMode }) => Object.assign({}, state, { info: Object.assign({}, state.info, {
      nextGame: Object.assign({}, state.info.nextGame, { gameMode })
    }) }),
    [SET_NEXT_SAFE_START]: ({ safeStart }) => Object.assign({}, state, { info: Object.assign({}, state.info, {
      nextGame: Object.assign({}, state.info.nextGame, { safeStart })
    }) })
  }[action.type];
  return r ? r(action) : state;
}
