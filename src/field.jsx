import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

class Cell extends Component {
  constructor(props){
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render(){
    const { mine, revealed, flagged, neighboringMineCount, onReveal, onFlag, onUnflag } = this.props;
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

class Field extends Component {
  constructor(props){
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.onRevealMap = new WeakMap();
    this.onFlagMap = new WeakMap();
    this.onUnflagMap = new WeakMap();
  }

  render(){
    const { cells, size, onReveal, onFlag, onUnflag } = this.props;
    const cellsInRows = cells.reduce((cellsInRows, cell, index) => {
      if (index % size === 0) cellsInRows.push([]);
      cellsInRows[cellsInRows.length - 1].push(cell);
      return cellsInRows;
    }, []);

    return <div
      style={{
        // position: 'absolute',
        whiteSpace: 'nowrap'
      }}
    >
      { cellsInRows.map((row, ri) =>
        <div key={`row-${ri}`}>
          { row.map((cell, ci) => {
            if (!this.onRevealMap.has(cell)){
              this.onRevealMap.set(cell, onReveal.bind(null, ri * size + ci));
            }
            const onRevealCell = this.onRevealMap.get(cell);
            if (!this.onFlagMap.has(cell)){
              this.onFlagMap.set(cell, onFlag.bind(null, ri * size + ci));
            }
            const onFlagCell = this.onFlagMap.get(cell);
            if (!this.onUnflagMap.has(cell)){
              this.onUnflagMap.set(cell, onUnflag.bind(null, ri * size + ci));
            }
            const onUnflagCell = this.onUnflagMap.get(cell);
            return <Cell key={`cell-${ri},${ci}`}
              {...cell}
              onReveal={ onRevealCell }
              onFlag={ onFlagCell }
              onUnflag={ onUnflagCell }
            ></Cell>;
          })}
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
