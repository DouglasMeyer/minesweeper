/* eslint-env browser */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|Provider|App)$" }]*/

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import * as actions from './actions';
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
        map: {
          seed: initialState.info.currentGame.seed,
          exploded: initialState.info.currentGame.reveals.solo.isGameOver,
          isPractice: initialState.info.currentGame.gameMode === 'learning',
          safeStart: initialState.info.currentGame.safeStart,
          revealCount: initialState.info.currentGame.reveals.solo.count
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

const { info: { map: { seed } } } = store.getState();
if (!seed) store.dispatch(actions.newGame({ safeStart: true, isPractice: false }));

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
