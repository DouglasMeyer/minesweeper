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
    const [ red, green, blue ] = Cell.cellColors[neighboringMineCount];
    return <span
      className='cell cell--revealed'
      style={{
        color: `rgba(${red}, ${green}, ${blue}, 1)`
      }}
    >{ neighboringMineCount === 0 ? '' : neighboringMineCount }</span>;
  }
}
Cell.cellColors = [
  /* eslint-disable */
  [   1,   1,   1 ], // 0
  [   0,   0,   1 ], // 1 blue
  [   0, 1/4, 2/3 ], // 2
  [   0, 2/4, 1/3 ], // 3
  [ 1/4, 3/4,   0 ], // 4
  [ 1/4, 4/5,   0 ], // 5 yellowish
  [ 2/4, 2/5,   0 ], // 6 orange
  [ 3/4, 1/5,   0 ], // 7
  [   1,   0,   0 ]  // 8 red
  /* eslint-enable */
].map(c => c.map(i => Math.floor(i * 255)));
Cell.propTypes = {
  mine: PropTypes.bool,
  revealed: PropTypes.bool,
  flagged: PropTypes.bool,
  neighboringMineCount: PropTypes.number,
  onReveal: PropTypes.func.isRequired,
  onFlag: PropTypes.func.isRequired,
  onUnflag: PropTypes.func.isRequired
};

class Field extends Component {
  constructor(props){
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render(){
    const { cells, position, size, onReveal, onFlag, onUnflag } = this.props;
    const cellsInRows = cells.reduce((cellsInRows, cell, index) => {
      if (index % size === 0) cellsInRows.push([]);
      cellsInRows[cellsInRows.length - 1].push(cell);
      return cellsInRows;
    }, []);

    return <div
      className='field'
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
