/* eslint-env browser */
import { REVEAL } from '../actions';
import { cellAt } from '../helpers';

export default function info(state, action){
  if (!state.info){
    state = Object.assign({}, state, {
      info: {
        reveals: [ 0 ],
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
        return Object.assign({}, state, {
          reveals: [
            state.reveals[0] + 1,
            ...state.reveals.slice(1)
          ]
        });
      }, state.info);
      return Object.assign({}, state, { info: newInfo });

    default:
      return state;
  }
}
