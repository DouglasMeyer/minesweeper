import { REVEAL } from '../actions';
import { cellAt } from '../helpers';

const defaultState = [
  { reveals: 0 }
];
export default function info(state, action){
  if (!state.info){
    state = Object.assign({}, state, { info: defaultState });
  }

  switch (action.type){
    case REVEAL:
      const fields = state.fields;
      const newInfo = action.positions.reduce((state, pos) => {
        const cell = cellAt(fields, pos.x, pos.y);
        if (cell.mine) return [ { reveals: 0 }, ...state ];
        return [
          Object.assign({}, state[0], {
            reveals: state[0].reveals + 1
          }),
          ...state.slice(1)
        ];
      }, state.info);
      return Object.assign({}, state, { info: newInfo });

    default:
      return state;
  }
}
