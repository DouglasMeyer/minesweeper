import { REVEAL, FLAG, UNFLAG } from '../actions';
import { fieldSize } from '../helpers';

import seedrandom from 'seedrandom';

const mineFrequency = 0.2;
const blankCells = [];
for (let i = 0; i < fieldSize * fieldSize; i++) blankCells.push(0);

function defaultState({ x, y }, seed){
  const position = {
    x: Math.floor(x / fieldSize),
    y: Math.floor(y / fieldSize)
  };
  const random = seedrandom(`${seed}_${position.x}_${position.y}`);
  const cells = blankCells
    .map(() => ({ mine: random() < mineFrequency }));
  return {
    position,
    cells
  };
}
function updateCell(state, i, props){
  return Object.assign({}, state, {
    cells: [
      ...state.cells.slice(0, i),
      Object.assign({}, state.cells[i], props),
      ...state.cells.slice(i + 1)
    ]
  });
}
function revealCells(state, positions){
  return positions.reduce((newState, { x, y }) => {
    const index = y * fieldSize + x;
    if (newState.cells[index].revealed) return newState;
    return updateCell(newState, index, {
      revealed: true,
      flagged: false
    });
  }, state);
}
export default function field(oldState, action, seed){
  const state = oldState || defaultState(action, seed);
  let flagged = false;

  switch (action.type){
    case REVEAL:
      return revealCells(state, action.positions);

    case FLAG:
      flagged = true;
    case UNFLAG:
      const { x, y } = action.positions[0];
      const index = y * fieldSize + x;
      return updateCell(state, index, {
        flagged
      });

    default:
      return state;
  }
}
