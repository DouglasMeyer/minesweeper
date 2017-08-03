/* eslint-env browser */
import { REVEAL, NEW_GAME } from '../actions';
import { cellAt, newSeed } from '../helpers';

const bestHardcoreKey = 'minesweeper.bestHardcore';

function buildNewMap({
  isPractice = false,
  safeStart = false,
  seed
}={}){
  return {
    seed: seed || newSeed(),
    exploded: false,
    isPractice,
    safeStart,
    revealCount: 0
  };
}

function init(){
  return {
    bestHardcore: null,
    map: buildNewMap()
  };
}

function newGame(state, { isPractice, safeStart }){
  return Object.assign({}, state, {
    info: Object.assign({}, state.info, {
      map: buildNewMap({ isPractice, safeStart })
    })
  });
}

export default function info(_state, action){
  const state = (_state && _state.info) ? _state : Object.assign({}, _state, { info: init() });

  const r = {
    [NEW_GAME]: newGame,
    [REVEAL]: state => {
      if (
        action.seed !== state.info.map.seed
      ) return state;
      const { fields } = state;
      const newInfo = action.positions.reduce((info, pos) => {
        const { map: { isPractice } } = info;
        const cell = cellAt(fields, pos.x, pos.y);
        let { map: { revealCount } } = info;
        if (!cell.mine) {
          revealCount += 1;
        } else if (!isPractice) {
          return Object.assign({}, info, {
            map: Object.assign({}, info.map, {
              exploded: true
            })
          });
        }
        let bestHardcore = info.bestHardcore;
        if (!isPractice && revealCount > bestHardcore) {
          bestHardcore = revealCount;
          try {
            localStorage.setItem(bestHardcoreKey, bestHardcore);
          } catch (e) { console.error(e); } // eslint-disable-line no-console
        }
        return Object.assign({}, info, {
          bestHardcore,
          map: Object.assign({}, info.map, { revealCount })
        });
      }, state.info);
      return Object.assign({}, state, { info: newInfo });
    }
  }[action.type];
  return r ? r(state, action) : state;
}
