import React, { PropTypes } from 'react';

function Cell({ mine, revealed, flagged }){
  if (flagged) return <span className="cell cell--flag"></span>;
  if (!revealed) return <a className="cell"></a>;
  if (mine) return <span className="cell cell--mine cell--revealed"></span>;
  return <span className="cell cell--revealed"></span>;
}
Cell.propTypes = {
  mine: PropTypes.bool,
  revealed: PropTypes.bool,
  flagged: PropTypes.bool
};

function Row({ cells }){
  return <div>{ cells.map((cell,ci) => <Cell key={ci} {...cell}></Cell> )}</div>;
}
Row.propTypes = {
  cells: PropTypes.arrayOf(PropTypes.shape(
    Cell.propTypes
  ).isRequired).isRequired
};

export default function Field({ rows }){
  return <div>{ rows.map((cells,ri) => <Row key={ri} cells={cells}></Row> )}</div>;
}
