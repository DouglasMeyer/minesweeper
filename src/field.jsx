import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

class Cell extends Component {
  constructor(props){
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render(){
    const { x, y, mine, revealed, flagged, neighboringMineCount, onReveal, onFlag, onUnflag } = this.props;
    if (flagged) {
      return <span className='cell cell--flag'
        onContextMenu={e => {
          e.preventDefault();
          onUnflag({ x, y });
        }}
      ></span>;
    }
    if (!revealed) {
      return <a className='cell'
        onClick={ () => onReveal({ x, y }) }
        onContextMenu={e => {
          e.preventDefault();
          onFlag({ x, y });
        }}
      ></a>;
    }
    if (mine) return <span className='cell cell--mine cell--revealed'></span>;
    return <span className='cell cell--revealed'>{ neighboringMineCount === 0 ? '' : neighboringMineCount }</span>;
  }
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

function Field({ cells, position, size, onReveal, onFlag, onUnflag }){
  const cellsInRows = cells.reduce((cellsInRows, cell, index) => {
    if (index % size === 0) cellsInRows.push([]);
    cellsInRows[cellsInRows.length - 1].push(cell);
    return cellsInRows;
  }, []);

  return <div
    style={{
      position: 'absolute',
      whiteSpace: 'nowrap',
      top: position.y * size * 16 * 2,
      left: position.x * size * 16 * 2
    }}
  >
    { cellsInRows.map((row, y) =>
      <div key={`row-${y}`}>
        { row.map((cell, x) =>
          <Cell key={`cell-${x},${y}`}
            {...cell}
            x={ position.x * size + x }
            y={ position.y * size + y }
            onReveal={ onReveal }
            onFlag={ onFlag }
            onUnflag={ onUnflag }
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
