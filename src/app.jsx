import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';

import Field from './field.jsx';
import FieldStatus from './field_status.jsx';
import { reveal, flag, unflag, keyDown, keyUp } from './actions';

export default function App({ field, position, onReveal, onFlag, onUnflag, onKeyDown, onKeyUp }){
  return <div
    className="app"
    tabIndex="0"
    onKeyDown={ e=>onKeyDown(e.nativeEvent.code) }
    onKeyUp={ e=>onKeyUp(e.nativeEvent.code) }
  >
    <FieldStatus field={ field.cells } position={ position }></FieldStatus>
    <Field
      {...field}
      onReveal={ onReveal }
      onFlag={ onFlag }
      onUnflag={ onUnflag }
    ></Field>
  </div>;
}

export default connect(
  state => ({
    field: state.field,
    position: state.tracking.position
  }),
  dispatch => ({
    onReveal: i=> dispatch(reveal(i)),
    onFlag: i=> dispatch(flag(i)),
    onUnflag: i=> dispatch(unflag(i)),
    onKeyDown: k=> dispatch(keyDown(k)),
    onKeyUp: k=> dispatch(keyUp(k))
  })
)(App);
