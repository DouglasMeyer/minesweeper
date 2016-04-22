/* eslint-env browser */
import { neighborIndexes } from './helpers';

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

export function reveal(...indexes){
  return (dispatch, getState) => {
    requestAnimationFrame(() => {
      const { cells, size } = getState().field;
      const unrevealedIndexes = indexes.filter(i => !cells[i].revealed);
      if (unrevealedIndexes.length === 0) return;
      dispatch({ type: REVEAL, indexes: unrevealedIndexes });

      const cellsToReveal = unrevealedIndexes.reduce((cellsToReveal, index) => {
        const cell = cells[index];
        if (!cell.mine && cell.neighboringMineCount) return cellsToReveal;
        return cellsToReveal.concat(
          neighborIndexes(size, index).filter(i => !cells[i].revealed)
        );
      }, [])
      .reduce((acc, i) => {
        if (acc.indexOf(i) !== -1) return acc;
        return [ ...acc, i ];
      }, []);
      if (cellsToReveal.length){
        requestAnimationFrame(() => {
          dispatch(reveal(...cellsToReveal));
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
