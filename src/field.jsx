import React, { PropTypes } from 'react';

function Cell({ mine, revealed, flagged, neighboringMineCount, onReveal, onFlag, onUnflag }){
  if (flagged) {
    return <span className='cell cell--flag'
      onContextMenu={e => {
        e.preventDefault();
        onUnflag();
      }}
    ></span>;
  }
  if (!revealed) {
    return <a className='cell'
      onClick={onReveal}
      onContextMenu={e => {
        e.preventDefault();
        onFlag();
      }}
    ></a>;
  }
  if (mine) return <span className='cell cell--mine cell--revealed'></span>;
  return <span className='cell cell--revealed'>{ neighboringMineCount === 0 ? '' : neighboringMineCount }</span>;
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

function Field({ cells, size, onReveal, onFlag, onUnflag }){
  const cellsInRows = cells.reduce((cellsInRows, cell, index) => {
    if (index % size === 0) cellsInRows.push([]);
    cellsInRows[cellsInRows.length - 1].push(cell);
    return cellsInRows;
  }, []);

  return <div
    style={{
      whiteSpace: 'nowrap'
    }}
  >
    { cellsInRows.map((row, ri) =>
      <div key={`row-${ri}`}>
        { row.map((cell, ci) =>
          <Cell key={`cell-${ri},${ci}`}
            {...cell}
            onReveal={ onReveal.bind(null, ri * size + ci) }
            onFlag={ onFlag.bind(null, ri * size + ci) }
            onUnflag={ onUnflag.bind(null, ri * size + ci) }
          ></Cell>
        )}
      </div>
    )}
  </div>;
}
Field.propTypes = {
  cells: PropTypes.arrayOf(PropTypes.shape({
    mine: PropTypes.bool.isRequired,
    revealed: PropTypes.bool,
    flagged: PropTypes.bool
  }).isRequired).isRequired,
  size: PropTypes.number.isRequired,
  onReveal: PropTypes.func.isRequired,
  onFlag: PropTypes.func.isRequired,
  onUnflag: PropTypes.func.isRequired
};

export default Field;
