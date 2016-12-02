/* eslint-env browser */
import { nineSquare, cellAt, fieldSize } from './helpers';

/*
 * action types
 */

export const REVEAL = 'REVEAL';
export const FLAG = 'FLAG';
export const UNFLAG = 'UNFLAG';
export const MOVE = 'MOVE';
export const NEW_GAME = 'NEW_GAME';

/*
 * action creators
 */

let positionsToReveal = [];
let revealing = false;
export function reveal(...positions){
  positionsToReveal = positionsToReveal.concat(positions);

  return (dispatch, getState) => {
    if (revealing) return;
    revealing = true;

    function doReveal(){
      revealing = false;
      const state = getState();
      const fields = state.fields;
      const { isGameOver } = state.info;
      if (isGameOver){
        positionsToReveal = [];
        return;
      }
      positionsToReveal = positionsToReveal.filter(p => {
        const cell = cellAt(fields, p.x, p.y);
        return cell && !cell.revealed;
      });
      if (positionsToReveal.length === 0) return;
      const positionsToRevealNow = positionsToReveal.splice(0, 20);
      dispatch({ type: REVEAL, positions: positionsToRevealNow });

      positionsToRevealNow.forEach(pos => {
        const cell = cellAt(fields, pos.x, pos.y);
        if (cell.neighboringMineCount) return;
        positionsToReveal = positionsToReveal.concat(
          nineSquare
          .map(d => ({ x: pos.x + d.x, y: pos.y + d.y }))
        );
      });
      if (positionsToReveal.length){
        requestAnimationFrame(doReveal);
      }
    }
    requestAnimationFrame(doReveal);
  };
}

export function revealSafe(){
  return (dispatch, getState) => {
    const fields = getState().fields;
    const center = { x: fieldSize / 2, y: fieldSize / 2 };
    const cellsToCheck = [center];
    /* eslint-disable */
    for (let i = 0, cellPos; cellPos = cellsToCheck[i]; i++){
      /* eslint-enable */
      let cell = cellAt(fields, cellPos.x, cellPos.y);
      if (!cell.mine && !cell.neighboringMineCount){
        reveal(cellPos)(dispatch, getState);
        return;
      }
      cellsToCheck.push(...nineSquare
        .map(({x, y}) => ({ x: cellPos.x + x, y: cellPos.y + y }))
        .filter(({x, y}) =>
          !cellsToCheck.some(p => p.x === x && p.y === y)
        )
      );
    }
  };
}

export function flag(position){
  return { type: FLAG, positions: [ position ] };
}

export function unflag(position){
  return { type: UNFLAG, positions: [ position ] };
}

const keyMap = {
  'KeyS': { y:  1, x:  0 },
  'KeyW': { y: -1, x:  0 },
  'KeyA': { y:  0, x: -1 },
  'KeyD': { y:  0, x:  1 },
  'ArrowUp':    { y: -1, x:  0 },
  'Up':         { y: -1, x:  0 },
  'ArrowDown':  { y:  1, x:  0 },
  'Down':       { y:  1, x:  0 },
  'ArrowLeft':  { y:  0, x: -1 },
  'Left':       { y:  0, x: -1 },
  'ArrowRight': { y:  0, x:  1 },
  'Right':      { y:  0, x:  1 }
};
const downedKeys = [];
let moving = false;
export function keyDown(key){
  if (!keyMap.hasOwnProperty(key) || downedKeys.indexOf(key) !== -1) return _ => {};
  downedKeys.push(key);
  if (moving) return _ => {};

  return dispatch => {
    let lastTime;
    function move(time){
      const timeDelta = time - lastTime;
      const step = timeDelta / 5;
      const { dx, dy } = downedKeys
        .map(key => keyMap[key])
        .reduce((posD, keyMapping) => {
          return {
            dx: posD.dx + keyMapping.x * step,
            dy: posD.dy + keyMapping.y * step
          };
        }, { dx: 0, dy: 0 });
      moving = dx || dy;
      if (moving){
        lastTime = time;
        requestAnimationFrame(move);
        dispatch({ type: MOVE, dx, dy });
      }
    }
    lastTime = performance.now();
    requestAnimationFrame(move);
  };
}

export function keyUp(key){
  const index = downedKeys.indexOf(key);
  if (index !== -1) downedKeys.splice(index, 1);
  return _ => {};
}

export function scroll({ dx, dy }){
  return { type: MOVE, dx, dy };
}

export function newGame(){
  return { type: NEW_GAME };
}
