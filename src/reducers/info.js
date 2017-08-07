/* eslint-env browser */
import { REVEAL, NEW_GAME, NEW_MAP } from '../actions';
import { cellAt, newSeed } from '../helpers';

function init(){
  return {
    bestHardcore: null,
    map: {
      revealCount: 0
    }
  };
}

export default function info(_state, action){
  const state = (_state && _state.info) ? _state : Object.assign({}, _state, { info: init() });

  const r = {
    [NEW_GAME]: (state, { isPractice, safeStart }) => Object.assign({}, state, {
      info: Object.assign({}, state.info, {
        map: { isPractice, safeStart }
      })
    }),
    [NEW_MAP]: state => Object.assign({}, state, {
      info: Object.assign({}, state.info, {
        map: Object.assign({}, state.info.map, {
          seed: newSeed(),
          exploded: false,
          revealCount: 0
        })
      })
    }),
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
        return Object.assign({}, info, {
          bestHardcore: Math.max(info.bestHardcore, revealCount),
          map: Object.assign({}, info.map, { revealCount })
        });
      }, state.info);
      return Object.assign({}, state, { info: newInfo });
    }
  }[action.type];
  return r ? r(state, action) : state;
}
