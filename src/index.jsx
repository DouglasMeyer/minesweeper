/* eslint-env browser */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|Provider|App)$" }]*/

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import reducers from './reducers';
import App from './app.jsx';

const store = createStore(
  reducers,
  applyMiddleware(thunk)
);

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
  render((
      <Provider store={store}>
        <App></App>
      </Provider>
    ),
    document.getElementById('container')
  );

  requestAnimationFrame(() => {
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
  });
});
