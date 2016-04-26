/* eslint-env browser */
import { nineSquare } from './helpers';

/*
 * action types
 */

export const REVEAL = 'REVEAL';
export const FLAG = 'FLAG';
export const UNFLAG = 'UNFLAG';
export const MOVE = 'MOVE';

/*
 * action creators
 */

const fieldSize = 10; // FIXME: Magic number

function cellAt(fields, x, y){
  const fx = Math.floor(x / fieldSize);
  const fy = Math.floor(y / fieldSize);
  const field = fields.find(field => {
    return field.position.x === fx && field.position.y === fy;
  });
  if (!field) return;
  return field.cells[(y - fy * fieldSize) * fieldSize + (x - fx * fieldSize)];
}

let positionsToReveal = [];
let revealing = false;
export function reveal(...positions){
  positionsToReveal = positionsToReveal.concat(positions);

  return (dispatch, getState) => {
    if (revealing) return;
    revealing = true;

    function doReveal(){
      revealing = false;
      const fields = getState().fields;
      positionsToReveal = positionsToReveal.filter(p => {
        const cell = cellAt(fields, p.x, p.y);
        return cell && !cell.revealed;
      });
      if (positionsToReveal.length === 0) return;
      const positionsToRevealNow = positionsToReveal.splice(0, 20);
      dispatch({ type: REVEAL, positions: positionsToRevealNow });

      positionsToRevealNow.forEach(pos => {
        const cell = cellAt(fields, pos.x, pos.y);
        if (!cell.mine && cell.neighboringMineCount) return;
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
  'KeyD': { y:  0, x:  1 }
};
const downedKeys = [];
let moving = false;
export function keyDown(key){
  if (keyMap.hasOwnProperty(key) && downedKeys.indexOf(key) !== -1) return _ => {};
  downedKeys.push(key);
  if (moving) return _ => {};

  return dispatch => {
    let lastTime;
    function move(time){
      const timeDelta = time - lastTime;
      const step = timeDelta / 10;
      const down  = downedKeys.indexOf('KeyS') !== -1;
      const up    = downedKeys.indexOf('KeyW') !== -1;
      const left  = downedKeys.indexOf('KeyA') !== -1;
      const right = downedKeys.indexOf('KeyD') !== -1;
      const dx = (left ? -step : 0) + (right ? step : 0);
      const dy = (up ? -step : 0) + (down ? step : 0);
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
