/* eslint-env browser */
/* global ga */
import firebase from './firebase';
import { nineSquare, cellAt, fieldSize, newSeed } from './helpers';

/*
 * action types
 */

export const REVEAL = 'REVEAL';
export const FLAG = 'FLAG';
export const UNFLAG = 'UNFLAG';
export const MOVE = 'MOVE';
export const NEW_GAME = 'NEW_GAME';
export const NEW_MAP = 'NEW_MAP';
export const SET_MAP = 'SET_MAP';
export const SET_PLAYER_ID = 'SET_PLAYER_ID';

/*
 * action creators
 */

const uidPromise = new Promise((resolve, reject) => {
  firebase.auth().signInAnonymously().then(resolve, reject);
});

let positionsToReveal = [];
let revealing = false;
export function reveal(...positions){
  positionsToReveal = positionsToReveal.concat(positions);

  return (dispatch, getState) => {
    if (revealing) return;
    requestAnimationFrame(doReveal);
    revealing = true;
    const { info: { game: { map: { seed } } } } = getState();

    function doReveal(){
      revealing = false;
      const { fields, info: { game: { map: { exploded } } } } = getState();
      if (exploded){
        positionsToReveal = [];
        return;
      }
      positionsToReveal = positionsToReveal.filter(p => {
        const cell = cellAt(fields, p.x, p.y);
        return cell && !cell.revealed;
      });
      if (positionsToReveal.length === 0) return;
      const positionsToRevealNow = positionsToReveal.splice(0, 20);
      if (mapRef){
        const totalRef = gameRef.child(`maps/${mapRef.key}/reveals`);
        let countRef;
        const revealCount = positionsToRevealNow.length;
        uidPromise.then(({ uid }) => {
          countRef = mapRef.child(`reveals/${uid}`);
          return Promise.all([
            new Promise(resolve => {
              totalRef.once('value', snapshot => { resolve(snapshot.val()); });
            }),
            new Promise(resolve => {
              countRef.once('value', snapshot => { resolve(snapshot.val()); });
            })
          ]);
        }).then(([ total, count ]) => {
          totalRef.set(total + revealCount);
          countRef.set(count + revealCount);
        });
        const actionRef = mapRef.child('actions').push();
        actionRef.set({
          action: 'reveal',
          positions: positionsToRevealNow.reduce((acc, position) =>
            Object.assign(acc, {
              [actionRef.child('positions').push().key]: position
            })
          , {})
        });
      } else {
        dispatch({ type: REVEAL, seed, positions: positionsToRevealNow });
      }

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
    const { info: { game: { map: { exploded } } } } = getState();
    if (!exploded){
      if (mapRef){
        const actionRef = mapRef.child('actions').push();
        actionRef.set({
          action: 'flag',
          positions: {
            [actionRef.child('positions').push().key]: position
          }
        });
      } else {
        dispatch({ type: FLAG, seed, positions: [ position ] });
      }
    }
  };
}

export function unflag(seed, position){
  return (dispatch, getState)=>{
    const { info: { game: { map: { exploded } } } } = getState();
    if (!exploded){
      if (mapRef){
        const actionRef = mapRef.child('actions').push();
        actionRef.set({
          action: 'unflag',
          positions: {
            [actionRef.child('positions').push().key]: position
          }
        });
      } else {
        dispatch({ type: UNFLAG, seed, positions: [ position ] });
      }
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

let gameRef;
export function newGame({ kind, isPractice, safeStart }){
  return dispatch => {
    if (window.ga) ga('send', 'event', 'Game', 'NEW_GAME', JSON.stringify({ kind, safeStart, isPractice }));
    let gameId;
    if (gameRef) {
      gameRef.child('maps').off();
    }
    gameRef = null;
    if (kind === 'public') {
      gameRef = firebase.database().ref('games').push();
      gameId = gameRef.key;
      gameRef.set({ safeStart, isPractice });
      gameRef.child('maps').on('child_added', data => {
        const id = data.key;
        const { seed, exploded } = data.val();
        dispatch(newMap({ id, seed, exploded }));
      });
      uidPromise.then(({ uid }) => {
        const playerRef = gameRef.child(`players/${uid}`);
        playerRef.set('Player 1');
      });
    }
    dispatch({ type: NEW_GAME, id: gameId, kind, isPractice, safeStart });
    dispatch(nextMap());
  };
}

export function joinGame(gameId){
  return dispatch => {
    if (gameRef) {
      gameRef.child('maps').off();
    }
    gameRef = null;
    // Temporary game while we join the game
    dispatch({ type: NEW_GAME, kind: 'solo', isPractice: true, safeStart: false });
    dispatch({ type: NEW_MAP, seed: '123' });
    dispatch({ type: SET_MAP, mapId: '123' });
    gameRef = firebase.database().ref(`games/${gameId}`);
    uidPromise.then(({ uid }) =>
      new Promise(resolve => {
        gameRef.once('value', gameSnapshot => {
          const id = gameSnapshot.key;
          console.log('gameSnapshot', gameSnapshot.val());
          const { isPractice, safeStart, players } = gameSnapshot.val();
          resolve({ uid, id, isPractice, safeStart, players });
        });
      })
    )
    .then(({ uid, id, isPractice, safeStart, players }) => {
      if (!players[uid]) {
        const playerCount = Object.keys(players || {}).length;
        const playerRef = gameRef.child(`players/${uid}`);
        playerRef.set(`Player ${playerCount+1}`);
      }
      gameRef.child('maps').once('value', mapsData => {
        dispatch({ type: NEW_GAME, id, kind: 'public', isPractice, safeStart });
        let mapId;
        mapsData.forEach(mapData => {
          mapId = mapData.key;
          const { seed, exploded } = mapData.val();
          dispatch(newMap({ id: mapId, seed, exploded }));
        });
        dispatch(setMap(mapId));

        gameRef.child('maps').on('child_added', data => {
          const id = data.key;
          const { seed, exploded } = data.val();
          dispatch(newMap({ id, seed, exploded }));
        });
      });
    });
  };
}

export function newMap({ id, seed=newSeed(), exploded = false } = {}){
  return (dispatch, getState) => {
    const { info: { game: { id: gameId } } } = getState();
    let mapId;
    if (gameId && !id) {
      const newMapRef = gameRef.child('maps').push();
      mapId = newMapRef.key;
      newMapRef.set({ seed, exploded });
    }
    dispatch({ type: NEW_MAP, id: id || mapId, seed, exploded });
  };
}

let mapRef;
export function setMap(mapId){ // mapId or seed
  return (dispatch, getState) => {
    const {
      info: { game: { id: gameId, safeStart, isPractice } }
    } = getState();
    if (window.ga) ga('send', 'event', 'Game', 'SET_MAP', JSON.stringify({ safeStart, isPractice }));

    if (mapRef) {
      mapRef.child('actions').off();
    }
    mapRef = null;
    if (gameId) {
      mapRef = firebase.database().ref(`map/${mapId}`);
      mapRef.child('actions').on('child_added', data => {
        const { fields, info: { game: { map: { seed } } } } = getState();
        const { action, positions: keyedPositions } = data.val();
        const type = {
          'reveal': REVEAL,
          'flag': FLAG,
          'unflag': UNFLAG
        }[action];
        const positions = Object.keys(keyedPositions).map(k => keyedPositions[k])
          .filter(position => {
            const cell = cellAt(fields, position.x, position.y);
            return action === 'reveal' && !cell.revealed ||
              action === 'flag' && (!cell.revealed && !cell.flagged) ||
              action === 'unflag' && (!cell.revealed && cell.flagged);
          });
        if (positions.length) dispatch({ type, seed, positions });
      });
    }

    dispatch({ type: SET_MAP, mapId });
    if (safeStart) dispatch(revealSafe());
  };
}

export function nextMap({ createMap = true }={}){
  return (dispatch, getState) => {
    const {
      info: { game: { nextMaps: [
        map,
        ..._
      ] } }
    } = getState();

    if (!map && createMap) {
      dispatch(newMap());
      dispatch(nextMap({ createMap: false }));
    } else if (map) {
      dispatch(setMap( map.id || map.seed ));
    }
  };
}

export function setPlayerId(playerId){
  return { type: SET_PLAYER_ID, playerId };
}
