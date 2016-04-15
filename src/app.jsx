import React from 'react';

import Field from './field.jsx';

function newCell(){
  return {
    mine: Math.random() > 0.5,
    revealed: Math.random() > 0.5,
    flagged: Math.random() > 0.5
  };
}
export default function App({}){
  const rows = [
    [newCell(),newCell(),newCell(),newCell(),newCell()],
    [newCell(),newCell(),newCell(),newCell(),newCell()],
    [newCell(),newCell(),newCell(),newCell(),newCell()],
    [newCell(),newCell(),newCell(),newCell(),newCell()],
    [newCell(),newCell(),newCell(),newCell(),newCell()]
  ];
  return <Field rows={ rows }></Field>
}
