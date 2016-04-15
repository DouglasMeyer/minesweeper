import React from 'react';
import { connect } from 'react-redux';

import Field from './field.jsx';
import FieldStatus from './field_status.jsx';
import { reveal, flag, unflag } from './actions';

export default function App({ field, onReveal, onFlag, onUnflag }){
  return <div>
    <FieldStatus field={ field }></FieldStatus>
    <Field
      rows={ field }
      onReveal={ onReveal }
      onFlag={ onFlag }
      onUnflag={ onUnflag }
    ></Field>
  </div>;
}

export default connect(
  state =>{ return { field: state.field }; },
  dispatch =>{ return {
    onReveal: (y,x)=> dispatch(reveal(x,y)),
    onFlag: (y,x)=> dispatch(flag(x,y)),
    onUnflag: (y,x)=> dispatch(unflag(x,y)),
  }; }
)(App);
