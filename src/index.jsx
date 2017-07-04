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
  initialState = JSON.parse(localStorage.getItem(stateKey));
} catch (e) { console.error(e); } // eslint-disable-line no-console
export const store = createStore(
  reducers,
  initialState,
  applyMiddleware(thunk)
);
store.subscribe(function(){
  try {
    localStorage.setItem(stateKey, JSON.stringify(store.getState()));
  } catch (e) { console.error(e); } // eslint-disable-line no-console
});

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
