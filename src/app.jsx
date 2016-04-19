import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';

import Field from './field.jsx';
import FieldStatus from './field_status.jsx';
import { reveal, flag, unflag } from './actions';

export default function App({ field, onReveal, onFlag, onUnflag }){
  return <div>
    <FieldStatus field={ field.cells }></FieldStatus>
    <Field
      {...field}
      onReveal={ onReveal }
      onFlag={ onFlag }
      onUnflag={ onUnflag }
    ></Field>
  </div>;
}

export default connect(
  state =>{ return { field: state.field }; },
  dispatch =>{ return {
    onReveal: i=> dispatch(reveal(i)),
    onFlag: i=> dispatch(flag(i)),
    onUnflag: i=> dispatch(unflag(i)),
  }; }
)(App);
