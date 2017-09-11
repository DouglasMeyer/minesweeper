/* eslint-env browser */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|Provider|App)$" }]*/

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import * as actions from './actions';
import firebase from './firebase';
export { actions };

import reducers from './reducers'; // eslint-disable-line import/first
import App from './app.jsx'; // eslint-disable-line import/first

const stateKey = 'minesweeper.state';
let initialState = null;
try {
  initialState = JSON.parse(localStorage.getItem(stateKey)) || { version: 1 };
  if (initialState.version === undefined) {
    console.log('Migrating to version 1'); // eslint-disable-line no-console
    initialState = {
      version: 1,
      info: {
        bestHardcore: initialState.info.bestHardcore,
        gameId: initialState.info.gameId,
        game: {
          id: initialState.info.game.id,
          kind: initialState.info.game.kind,
          isPractice: initialState.info.game.isPractice,
          safeStart: initialState.info.game.safeStart,
          previousMaps: initialState.info.game.previousMaps, // id, seed, exploded, revealCount
          map: {
            id: initialState.info.map.id,
            seed: initialState.info.map.seed,
            exploded: initialState.info.map.exploded,
            revealCount: initialState.info.map.revealCount
          },
          nextMaps: initialState.info.game.nextMaps // id, seed, exploded, revealCount
        }
      },
      tracking: initialState.tracking,
      fields: initialState.fields
    };
  }
} catch (e) { console.error(e); } // eslint-disable-line no-console

export const store = createStore(
  reducers,
  initialState,
  applyMiddleware(thunk)
);
let storeStateTimeout;
store.subscribe(function(){
  if (storeStateTimeout) clearTimeout(storeStateTimeout);
  storeStateTimeout = setTimeout(function(){
    storeStateTimeout = null;
    try {
      localStorage.setItem(stateKey, JSON.stringify(store.getState()));
    } catch (e) { console.error(e); } // eslint-disable-line no-console
  }, 500);
});

function hashChange(){
  const joinMatch = location.hash.match(/joinGame=([^&]*)/);
  const joinGame = joinMatch && joinMatch[1];
  if (joinGame) store.dispatch(actions.joinGame(joinGame));
  location.hash = "";
}
addEventListener("hashchange", hashChange, false);
hashChange();

const { info: { game } } = store.getState();
if (!game) store.dispatch(actions.newGame({ kind: 'solo', isPractice: false, safeStart: true }));
else if (game.id) store.dispatch(actions.joinGame(game.id));

if (!window.requestAnimationFrame){
  window.requestAnimationFrame = function(cb){
    setTimeout(function(){
      cb(performance.now());
    }, 1);
  };
}

if (!performance.now){
  performance.now = function(){
    return Date.now();
  };
}

document.addEventListener("DOMContentLoaded", function(){
  render(
    <Provider store={store}>
      <App></App>
    </Provider>,
    document.getElementById('container')
  );

  requestAnimationFrame(() => {
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
  });
});
