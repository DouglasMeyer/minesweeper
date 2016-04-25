import { REVEAL, FLAG, UNFLAG } from '../actions';

const frameSize = 10; // FIXME: Magic number
const mineFrequency = 0.2;
const blankCells = [];
for (let i = 0; i < frameSize * frameSize; i++) blankCells.push(0);

function defaultState({ x, y }){
  const position = {
    x: Math.floor(x / frameSize),
    y: Math.floor(y / frameSize)
  };
  const cells = blankCells
    .map(() => ({ mine: Math.random() < mineFrequency }));
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
    const index = y * frameSize + x;
    if (newState.cells[index].revealed) return newState;
    return updateCell(newState, index, {
      revealed: true,
      flagged: false
    });
  }, state);
}
export default function field(oldState, action){
  const state = oldState || defaultState(action);
  let flagged = false;

  switch (action.type){
    case REVEAL:
      return revealCells(state, action.positions);

    case FLAG:
      flagged = true;
    case UNFLAG:
      const { x, y } = action.positions[0];
      const index = y * frameSize + x;
      return updateCell(state, index, {
        flagged
      });

    default:
      return state;
  }
}
