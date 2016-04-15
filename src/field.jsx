import React, { PropTypes } from 'react';

function Cell({ mine, revealed, flagged, neighboringMineCount, onReveal, onFlag, onUnflag }){
  if (flagged)
    return <span className="cell cell--flag"
      onContextMenu={(e)=>{
        e.preventDefault();
        onUnflag();
      }}
    ></span>;
  if (!revealed)
    return <a className="cell"
      onClick={onReveal}
      onContextMenu={(e)=>{
        e.preventDefault()
        onFlag();
      }}
    ></a>;
  if (mine) return <span className="cell cell--mine cell--revealed"></span>;
  return <span className="cell cell--revealed">{ neighboringMineCount === 0 ? '' : neighboringMineCount }</span>;
}
Cell.propTypes = {
  mine: PropTypes.bool,
  revealed: PropTypes.bool,
  flagged: PropTypes.bool,
  neighboringMineCount: PropTypes.number,
  onReveal: PropTypes.func.isRequired,
  onFlag: PropTypes.func.isRequired,
  onUnflag: PropTypes.func.isRequired
};

function Row({ cells, onReveal, onFlag, onUnflag }){
  return <div>{ cells.map((cell,ci) =>
    <Cell key={ci}
      {...cell}
      onReveal={ onReveal.bind(null, ci) }
      onFlag={ onFlag.bind(null, ci) }
      onUnflag={ onUnflag.bind(null, ci) }
    ></Cell>
  )}</div>;
}
Row.propTypes = {
  cells: PropTypes.arrayOf(PropTypes.shape({
    mine: PropTypes.bool,
    revealed: PropTypes.bool,
    flagged: PropTypes.bool
  }).isRequired).isRequired,
  onReveal: PropTypes.func.isRequired,
  onFlag: PropTypes.func.isRequired,
  onUnflag: PropTypes.func.isRequired
};

function Field({ rows, onReveal, onFlag, onUnflag }){
  return <div>{ rows.map((cells,ri) =>
    <Row key={ri}
      cells={cells}
      onReveal={ onReveal.bind(null, ri) }
      onFlag={ onFlag.bind(null, ri) }
      onUnflag={ onUnflag.bind(null, ri) }
    ></Row>
  )}</div>;
}
Field.propTypes = {
  rows: PropTypes.array.isRequired,
  onReveal: PropTypes.func.isRequired,
  onFlag: PropTypes.func.isRequired,
  onUnflag: PropTypes.func.isRequired
};

export default Field;
