/*
 * action types
 */

export const REVEAL = 'REVEAL';
export const FLAG = 'FLAG';
export const UNFLAG = 'UNFLAG';

/*
 * action creators
 */

export function reveal(x,y){
  return (dispatch, getState)=>{
    const field = getState().field,
          cell = field[y] && field[y][x];
    if (!cell || cell.revealed) return;
    dispatch({ type: REVEAL, x, y });

    if (cell.mine || cell.neighboringMineCount === 0) {
      const cellsToReveal = [
          { dx: -1, dy: -1 },
          { dx:  0, dy: -1 },
          { dx:  1, dy: -1 },
          { dx: -1, dy:  0 },
          { dx:  1, dy:  0 },
          { dx: -1, dy:  1 },
          { dx:  0, dy:  1 },
          { dx:  1, dy:  1 }
        ].map(({dx,dy})=>({ x: x+dx, y: y+dy }))
        .filter(({x,y})=> field[y] && field[y][x] && !field[y][x].revealed);
      if (cellsToReveal.length){
        requestAnimationFrame(()=>{
          cellsToReveal
          .forEach(({x,y})=>{
            dispatch(reveal(x,y));
          });
        });
      }
    }
  }
}

export function flag(x,y){
  return { type: FLAG, x, y };
}

export function unflag(x,y){
  return { type: UNFLAG, x, y };
}
