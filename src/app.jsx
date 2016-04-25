/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|Field|FieldStatus)$" }]*/
import React from 'react';
import { connect } from 'react-redux';

import Field from './field.jsx';
import FieldStatus from './field_status.jsx';
import { reveal, flag, unflag, keyDown, keyUp } from './actions';

export default function App({ fields, onReveal, onFlag, onUnflag, onKeyDown, onKeyUp }){
  return <div
    className='app'
    tabIndex={0}
    onKeyDown={ e => onKeyDown(e.nativeEvent.code) }
    onKeyUp={ e => onKeyUp(e.nativeEvent.code) }
  >
    { fields.map(field => {
      return <Field
        key={`${field.position.x}-${field.position.y}`}
        {...field}
        size={10 /* FIXME: magic number */}
        onReveal={ onReveal }
        onFlag={ onFlag }
        onUnflag={ onUnflag }
      ></Field>;
    })}
  </div>;
}

export default connect(
  state => ({
    fields: state.fields
  }),
  dispatch => ({
    onReveal: pos => dispatch(reveal(pos)),
    onFlag: pos => dispatch(flag(pos)),
    onUnflag: pos => dispatch(unflag(pos)),
    onKeyDown: k => dispatch(keyDown(k)),
    onKeyUp: k => dispatch(keyUp(k))
  })
)(App);
