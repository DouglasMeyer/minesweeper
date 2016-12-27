import { MOVE, NEW_GAME } from '../actions';

export function init(){
  return {
    position: { x: 0, y: 0 }
  };
}

export default function tracking(oldState, action){
  const state = (oldState && oldState.tracking) ? oldState : Object.assign({}, oldState, { tracking: init() });

  switch (action.type){
    case NEW_GAME:
      return Object.assign({}, state, { tracking: init() });

    case MOVE:
      return Object.assign({}, state, {
        tracking: Object.assign({}, state.tracking, {
          position: {
            x: state.tracking.position.x + action.dx,
            y: state.tracking.position.y + action.dy
          }
        })
      });

    default:
      return state;
  }
}
