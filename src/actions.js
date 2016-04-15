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
  return { type: REVEAL, x, y };
}

export function flag(x,y){
  return { type: FLAG, x, y };
}

export function unflag(x,y){
  return { type: UNFLAG, x, y };
}
