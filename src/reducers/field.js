import { neighborIndexes } from '../helpers';
import { REVEAL, FLAG, UNFLAG } from '../actions';

function newCell(){
  return { mine: Math.random() < 0.2 };
}
const defaultState = {
  size: 30,
  cells: []
};
for (let i=0; i<defaultState.size*defaultState.size; i++){
  defaultState.cells.push(newCell());
}
for (let i=0; i<defaultState.size*defaultState.size; i++){
  let cell = defaultState.cells[i];
  cell.neighboringMineCount =
    neighborIndexes(defaultState.size, i)
    .reduce((count, neighborIndex)=>{
      return count + (defaultState.cells[neighborIndex].mine ? 1 : 0);
    }, 0);
}
function updateCell(state, i, props){
  return {
    size: state.size,
    cells: [
      ...state.cells.slice(0, i),
      Object.assign({}, state.cells[i], props),
      ...state.cells.slice(i+1)
    ]
  };
}
function revealCells(state, indexes){
  return indexes.reduce((newState, index)=>{
    if (newState.cells[index].revealed) return newState;
    return updateCell(newState, index, {
      revealed: true,
      flagged: false
    });
  }, state);
}
export default function field(state=defaultState, action){
  switch (action.type){
    case REVEAL:
      return revealCells(state, action.indexes);

    case FLAG:
      return updateCell(state, action.index, {
        flagged: true
      });

    case UNFLAG:
      return updateCell(state, action.index, {
        flagged: false
      });

    default:
      return state;
  }
}
