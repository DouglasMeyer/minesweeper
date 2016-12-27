import { MOVE, NEW_GAME } from '../actions';

export function init(){
  return {
    position: { x: 0, y: 0 }
  };
}

export default function tracking(_state, action){
  const state = (_state && _state.tracking) ? _state : Object.assign({}, _state, { tracking: init() });

  const r = {
    [NEW_GAME]: ()=> Object.assign({}, state, { tracking: init() }),
    [MOVE]: ({ dx, dy })=> Object.assign({}, state, {
        tracking: Object.assign({}, state.tracking, {
          position: {
            x: state.tracking.position.x + dx,
            y: state.tracking.position.y + dy
          }
        })
      })
  }[action.type];
  return r ? r(action) : state;
}
