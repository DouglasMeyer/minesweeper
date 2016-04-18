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
    const field = getState().field,
          size = 20, //FIXME: magic number
          unrevealedIndexes = indexes.filter(i=> !field[i].revealed);
    if (unrevealedIndexes.length === 0) return;
    dispatch({ type: REVEAL, indexes: unrevealedIndexes });

    const cellsToReveal = unrevealedIndexes.reduce((cells, index)=>{
              const cell = field[index];
              if (!cell.mine && cell.neighboringMineCount) return cells;
              return cells.concat(
                neighborIndexes(size, index).filter(i=> !field[i].revealed)
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
