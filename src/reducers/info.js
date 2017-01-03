/* eslint-env browser */
import { REVEAL, NEW_GAME, SET_GAME_MODE, SET_SAFE_START, SET_NEXT_GAME_MODE, SET_NEXT_SAFE_START, SET_MAP_SEED } from '../actions';
import { cellAt, newSeed } from '../helpers';

const bestHardcoreKey = 'minesweeper.bestHardcore';

function init(){
    let bestHardcore = localStorage.getItem(bestHardcoreKey);
    if (bestHardcore) bestHardcore = parseInt(bestHardcore, 10);
  return {
    gameMode: 'normal',
    safeStart: false,
    info: {
      reveals: [ 0 ],
      bestHardcore,
      seed: newSeed(),
      gameMode: 'normal',
      safeStart: false
    }
  };
}

export default function info(_state, action){
  const state = (_state && _state.info) ? _state : Object.assign({}, _state, init());

  const r = {
    [NEW_GAME]: ()=> Object.assign({}, state, {
      info: Object.assign({}, state.info, {
        reveals: [ 0 ],
        gameOverMove: null,
        seed: newSeed()
      })
    }),
    [REVEAL]: ()=> {
      const fields = state.fields;
      const isHardcore = state.info.gameMode !== 'learning';
      const newInfo = action.positions.reduce((state, pos) => {
        const cell = cellAt(fields, pos.x, pos.y);
        if (cell.mine) {
          if (isHardcore){
            return Object.assign({}, state, {
              gameOverMove: action
            });
          } else {
            return Object.assign({}, state, {
              reveals: [ 0, ...state.reveals ]
            });
          }
        }
        const currentReveals = state.reveals[0] + 1;
        let bestHardcore = state.bestHardcore;
        if (isHardcore && currentReveals > bestHardcore) {
          bestHardcore = currentReveals;
          try {
            localStorage.setItem(bestHardcoreKey, bestHardcore);
          } catch (e) { console.error(e); } // eslint-disable-line no-console
        }
        return Object.assign({}, state, {
          bestHardcore,
          reveals: [
            currentReveals,
            ...state.reveals.slice(1)
          ]
        });
      }, state.info);
      return Object.assign({}, state, { info: newInfo });
    },
    [SET_MAP_SEED]: ({ mapSeed }) => Object.assign({}, state, {
      info: Object.assign({}, state.info, { mapSeed })
    }),
    [SET_GAME_MODE]: ({ gameMode }) => Object.assign({}, state, { gameMode }),
    [SET_SAFE_START]: ({ safeStart }) => Object.assign({}, state, { safeStart }),
    [SET_NEXT_GAME_MODE]: ({ gameMode }) => Object.assign({}, state, {
      info: Object.assign({}, state.info, { gameMode })
    }),
    [SET_NEXT_SAFE_START]: ({ safeStart }) => Object.assign({}, state, {
      info: Object.assign({}, state.info, { safeStart })
    })
  }[action.type];
  return r ? r(action) : state;
}
