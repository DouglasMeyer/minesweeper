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

export function reveal(...positions){
  return (dispatch, getState) => {
    requestAnimationFrame(() => {
      const fields = getState().fields;
      const unrevealedPositions = positions.filter(p => {
        const cell = cellAt(fields, p.x, p.y);
        return cell && !cell.revealed;
      });
      if (unrevealedPositions.length === 0) return;
      dispatch({ type: REVEAL, positions: unrevealedPositions });

      const positionsToReveal = unrevealedPositions.reduce((positionsToReveal, pos) => {
        const cell = cellAt(fields, pos.x, pos.y);
        if (!cell.mine && cell.neighboringMineCount) return positionsToReveal;
        return positionsToReveal.concat(
          nineSquare.map(d => ({ x: pos.x + d.x, y: pos.y + d.y }))
        );
      }, [])
      .reduce((acc, pos) => {
        if (acc.indexOf(pos) !== -1) return acc;
        const cell = cellAt(fields, pos.x, pos.y);
        if (!cell || cell.revealed) return acc;
        return [ ...acc, pos ];
      }, []);
      if (positionsToReveal.length){
        requestAnimationFrame(() => {
          dispatch(reveal(...positionsToReveal));
        });
      }
    });
  };
}

export function flag(index){
  return { type: FLAG, index };
}

export function unflag(index){
  return { type: UNFLAG, index };
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
