/* eslint-env browser */
import { REVEAL, NEW_GAME, SET_GAME_MODE, SET_SAFE_START, SET_NEXT_GAME_MODE, SET_NEXT_SAFE_START, PEER_OPEN } from '../actions';
import { cellAt } from '../helpers';

const bestHardcoreKey = 'minesweeper.bestHardcore';

const newSeed = Math.seedrandom.bind(null, null, { pass: (_prng, seed)=> seed });

function newGame({
  gameMode = 'normal',
  safeStart = false,
  seed
}={},
peerId){
  return {
    gameMode,
    safeStart,
    reveals: { [peerId]: { count: 0, isGameOver: false } },
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
    currentGame: newGame(undefined, 'solo'),
    nextGames: [ newGame(undefined, 'solo') ]
  };
}

export default function info(_state, action){
  const state = (_state && _state.info) ? _state : Object.assign({}, _state, { info: init() });

  const r = {
    [NEW_GAME]: ({ currentGame = state.info.nextGames[0], nextGames = state.info.nextGames.slice(1) })=>{
      const previousGames = state.info.previousGames.concat([ state.info.currentGame ]);
      const { peerId } = state.info;
      if (!nextGames[0]) nextGames = [ newGame(Object.assign({}, currentGame, { seed: null }), peerId) ];
      return Object.assign({}, state, {
        info: Object.assign({}, state.info, {
          previousGames,
          currentGame: Object.assign({}, currentGame, {
            reveals: Object.assign({}, currentGame.reveals, {
              [peerId]: currentGame.reveals[peerId] || { count: 0, isGameOver: false }
            })
          }),
          nextGames
        })
      });
    },
    [PEER_OPEN]: ({peerId}) => Object.assign({}, state, {
      info: Object.assign({}, state.info, {
        peerId,
        currentGame: Object.assign({}, state.info.currentGame, {
          reveals: Object.assign({}, state.info.currentGame.reveals, {
            solo: undefined,
            [peerId]: state.info.currentGame.reveals.solo
          })
        })
      })
    }),
    [REVEAL]: ()=> {
      if (
        action.seed !== state.info.currentGame.seed
      ) return state;
      const { fields, info: { peerId } } = state;
      const newInfo = action.positions.reduce((info, pos) => {
        const isLearning = info.currentGame.gameMode === 'learning';
        const cell = cellAt(fields, pos.x, pos.y);
        let reveals = info.currentGame.reveals;
        if (action.peerId === peerId ) {
          if (!cell.mine) {
            reveals = Object.assign({}, reveals, {
              [info.peerId]: Object.assign({}, reveals[peerId], {
                count: reveals[peerId].count + 1
              })
            });
          } else if (!isLearning) {
            reveals = Object.assign({}, reveals, {
              [info.peerId]: Object.assign({}, reveals[peerId], {
                isGameOver: true
              })
            });
          }
        }
        let bestHardcore = info.bestHardcore;
        if (!isLearning && reveals[peerId].count > bestHardcore) {
          bestHardcore = reveals[peerId].count;
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
      nextGames: [
        ...state.info.nextGames.slice(0,-1),
        Object.assign({}, state.info.nextGames.slice(-1)[0], { gameMode })
      ]
    }) }),
    [SET_NEXT_SAFE_START]: ({ safeStart }) => Object.assign({}, state, { info: Object.assign({}, state.info, {
      nextGames: [
        ...state.info.nextGames.slice(0,-1),
        Object.assign({}, state.info.nextGames.slice(-1)[0], { safeStart })
      ]
    }) })
  }[action.type];
  return r ? r(action) : state;
}
