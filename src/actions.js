import { neighborIndexes } from './helpers';

/*
 * action types
 */

export const REVEAL = 'REVEAL';
export const FLAG = 'FLAG';
export const UNFLAG = 'UNFLAG';

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
