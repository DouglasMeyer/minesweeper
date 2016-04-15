import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import reducers from './reducers';
import App from './app.jsx';

const store = createStore(reducers);

render((
    <Provider store={store}>
      <App></App>
    </Provider>
  ),
  document.getElementById('container')
);
