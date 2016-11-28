import { MOVE } from '../actions';

export function init(){
  return {
    position: { x: 0, y: 0 }
  };
}

export default function tracking(state, action){
  switch (action.type){
    case MOVE:
      return Object.assign({}, state, {
        position: {
          x: state.position.x + action.dx,
          y: state.position.y + action.dy
        }
      });

    default:
      return state;
  }
}
