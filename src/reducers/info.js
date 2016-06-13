/* eslint-env browser */
import { REVEAL } from '../actions';
import { cellAt } from '../helpers';

const bestHardcoreKey = 'minesweeper.bestHardcore';

export default function info(state, action){
  if (!state.info){
    let bestHardcore = localStorage.getItem(bestHardcoreKey);
    if (bestHardcore) bestHardcore = parseInt(bestHardcore, 10);
    state = Object.assign({}, state, {
      info: {
        reveals: [ 0 ],
        bestHardcore,
        options: location.hash
          .slice(1)
          .split(',')
          .filter(e => e)
          .reduce((state, key) => {
            return Object.assign({}, state, {
              [key]: true
            });
          }, {
            safeStart: false,
            hardcore: false
          })
      }
    });
  }
  const isHardcore = state.info.options.hardcore;

  switch (action.type){
    case REVEAL:
      const fields = state.fields;
      const newInfo = action.positions.reduce((state, pos) => {
        const cell = cellAt(fields, pos.x, pos.y);
        if (cell.mine) {
          if (isHardcore){
            return Object.assign({}, state, {
              isGameOver: true
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
          } catch (e) { console.error(e); }
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

    default:
      return state;
  }
}
