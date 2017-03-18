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
export const SET_GAME_MODE = 'SET_GAME_MODE';
export const SET_SAFE_START = 'SET_SAFE_START';
export const SET_NEXT_GAME_MODE = 'SET_NEXT_GAME_MODE';
export const SET_NEXT_SAFE_START = 'SET_NEXT_SAFE_START';
export const PEER_OPEN = 'PEER_OPEN';
export const PEER_CONNECTED = 'PEER_CONNECTED';
export const PEER_DISCONNECTED = 'PEER_DISCONNECTED';
export const SET_PEERS = 'SET_PEERS';
export const PEER_UNAVAILABLE = 'PEER_UNAVAILABLE';

/*
 * action creators
 */

let positionsToReveal = [];
let revealing = false;
export function reveal(...positions){
  positionsToReveal = positionsToReveal.concat(positions);

  return (dispatch, getState) => {
    if (revealing) return;
    requestAnimationFrame(doReveal);
    revealing = true;
    const { seed } = getState().info.currentGame;

    function doReveal(){
      revealing = false;
      const { fields, info: { peerId, currentGame: { reveals } } } = getState();
      const { isGameOver } = reveals[peerId];
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
      dispatch({ type: REVEAL, seed, peerId, positions: positionsToRevealNow });

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
        .filter(({x, y})=> x !== 0 && y !== 0)
        .map(({x, y}) => ({ x: cellPos.x + x, y: cellPos.y + y }))
      );
    }
  };
}

export function flag(seed, position){
  return (dispatch, getState)=>{
    const { info: { peerId, currentGame: { reveals } } } = getState();
    const { isGameOver } = reveals[peerId];
    if (!isGameOver){
      dispatch({ type: FLAG, seed, positions: [ position ] });
    }
  };
}

export function unflag(seed, position){
  return (dispatch, getState)=>{
    const { info: { peerId, currentGame: { reveals } } } = getState();
    const { isGameOver } = reveals[peerId];
    if (!isGameOver){
      dispatch({ type: UNFLAG, seed, positions: [ position ] });
    }
  };
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
export function keyDown(event){
  const key = event.nativeEvent.code || event.nativeEvent.key;
  const inKeyMap = keyMap.hasOwnProperty(key);
  if (inKeyMap || key === 'Backspace') event.preventDefault();
  if (!inKeyMap || downedKeys.indexOf(key) !== -1) return _ => {};
  downedKeys.push(key);
  if (moving) return _ => {};
  moving = true;

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
      moving = downedKeys.length !== 0;
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

export function keyUp(event){
  const key = event.nativeEvent.code || event.nativeEvent.key;
  const index = downedKeys.indexOf(key);
  if (index !== -1) downedKeys.splice(index, 1);
  return _ => {};
}

export function scroll({ dx, dy }){
  return { type: MOVE, dx, dy };
}

export function newGame({ currentGame, nextGame, positionsToReveal, positionsToFlag }={}){
  return { type: NEW_GAME, currentGame, nextGame, positionsToReveal, positionsToFlag };
}

export function setGameMode(gameMode){
  return { type: SET_GAME_MODE, gameMode };
}

export function setSafeStart(safeStart){
  return { type: SET_SAFE_START, safeStart };
}

export function setNextGameMode(gameMode){
  return { type: SET_NEXT_GAME_MODE, gameMode };
}

export function setNextSafeStart(safeStart){
  return { type: SET_NEXT_SAFE_START, safeStart };
}

export function peerOpen(peerId){
  return { type: PEER_OPEN, peerId };
}

export function peerConnected(peerId){
  return { type: PEER_CONNECTED, peerId };
}

export function peerDisconnected(peerId){
  return { type: PEER_DISCONNECTED, peerId };
}

export function setPeers(peers){
  return { type: SET_PEERS, peers };
}

export function peerUnavailable(peerId){
  return { type: PEER_UNAVAILABLE, peerId };
}
