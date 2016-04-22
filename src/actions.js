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
  return (dispatch, getState)=>{
    const { cells, size } = getState().field,
          unrevealedIndexes = indexes.filter(i=> !cells[i].revealed);
    if (unrevealedIndexes.length === 0) return;
    dispatch({ type: REVEAL, indexes: unrevealedIndexes });

    const cellsToReveal = unrevealedIndexes.reduce((cellsToReveal, index)=>{
        const cell = cells[index];
        if (!cell.mine && cell.neighboringMineCount) return cellsToReveal;
        return cellsToReveal.concat(
          neighborIndexes(size, index).filter(i=> !cells[i].revealed)
        );
      }, [])
      .reduce((acc,i)=>{
        if (acc.indexOf(i) !== -1) return acc;
        return [ ...acc, i ];
      }, []);
    if (cellsToReveal.length){
      requestAnimationFrame(()=>{
        dispatch(reveal(...cellsToReveal));
      });
    }
  }
}

export function flag(index){
  return { type: FLAG, index };
}

export function unflag(index){
  return { type: UNFLAG, index };
}

const downedKeys = [];
export function keyDown(key){
  if (downedKeys.indexOf(key) === -1) downedKeys.push(key);

  return dispatch => {
    function move(){
      const down = downedKeys.indexOf('KeyS') !== -1,
            up   = downedKeys.indexOf('KeyW') !== -1,
            left = downedKeys.indexOf('KeyA') !== -1,
            right= downedKeys.indexOf('KeyD') !== -1,
            dx = (left ? -1 : 0) + (right ? 1 : 0),
            dy = (up ? -1 : 0) + (down ? 1 : 0);
      if (dx || dy){
        requestAnimationFrame(move);
        dispatch({ type: MOVE, dx, dy });
      }
    }
    requestAnimationFrame(move);
  };
}

export function keyUp(key){
  const index = downedKeys.indexOf(key);
  if (index !== -1) downedKeys.splice(index, 1);
  return dispatch=>{};
}
