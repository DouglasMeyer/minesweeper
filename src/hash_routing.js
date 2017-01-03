/* eslint-env browser */
import { setGameMode, setSafeStart, setPlayers } from './actions';

export function setHash(hashOptions){
  return { type: 'SET_HASH', hashOptions };
}

export default function({ dispatch }){
  const { gameMode, safeStart, players } = location.hash
    .slice(1)
    .split(',')
    .reduce((hash,str) => {
      const [ key, value ] = str.split("=");
      if (key !== '')
        hash[key] = value === undefined ? true : value;
      return hash;
    }, {
      gameMode: 'normal',
      safeStart: false
    });
  // Timeout required so thunk is available
  setTimeout(()=>{
    dispatch(setGameMode(gameMode));
    dispatch(setSafeStart(safeStart));
    dispatch(setPlayers(players));
  });

  return next=> action=> {
    const reducer = {
      'SET_HASH': ()=> (state, _action)=> state
    }[action.type];
    return reducer ? reducer(action) : next(action);
  };
}
