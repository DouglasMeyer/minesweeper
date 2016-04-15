import React from 'react';
import { connect } from 'react-redux';

import Field from './field.jsx';
import { reveal, flag, unflag } from './actions';

export default function App({ field, onReveal, onFlag, onUnflag }){
  return <Field
    rows={ field }
    onReveal={ onReveal }
    onFlag={ onFlag }
    onUnflag={ onUnflag }
  ></Field>
}

export default connect(
  state =>{ return { field: state.field }; },
  dispatch =>{ return {
    onReveal: (y,x)=> dispatch(reveal(x,y)),
    onFlag: (y,x)=> dispatch(flag(x,y)),
    onUnflag: (y,x)=> dispatch(unflag(x,y)),
  }; }
)(App);
