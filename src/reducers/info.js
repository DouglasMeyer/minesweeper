/* eslint-env browser */
import { REVEAL, NEW_GAME } from '../actions';
import { cellAt, newSeed } from '../helpers';

const bestHardcoreKey = 'minesweeper.bestHardcore';

export function init(){
  let bestHardcore = localStorage.getItem(bestHardcoreKey);
  if (bestHardcore) bestHardcore = parseInt(bestHardcore, 10);
  const hashOptions = location.hash
    .slice(1)
    .split(',')
    .reduce((hash,str) => {
      const [ key, value ] = str.split("=");
      if (key !== '')
        hash[key] = value === undefined ? true : value;
      return hash;
    }, {
      gameMode: 'normal',
      safeStart: false
    });
  const seed = hashOptions.mapKey || newSeed();
  return {
    reveals: [ 0 ],
    bestHardcore,
    seed,
    options: hashOptions
  };
}

export default function info(_state, action){
  const state = (_state && _state.info) ? _state : Object.assign({}, _state, { info: init() });

  const r = {
    [NEW_GAME]: ()=> Object.assign({}, state, { info: init() }),
    [REVEAL]: ()=> {
      const fields = state.fields;
      const isHardcore = state.info.options.gameMode !== 'learning';
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
    }
  }[action.type];
  return r ? r(action) : state;
}
