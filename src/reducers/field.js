import { neighborIndexes } from '../helpers';
import { REVEAL, FLAG, UNFLAG } from '../actions';

function newCell(){
  return { mine: Math.random() < 0.1 };
}
const size = 20;
const initialField = []
for (let i=0; i<size*size; i++){
  initialField.push(newCell());
}
for (let i=0; i<size*size; i++){
  let cell = initialField[i];
  cell.neighboringMineCount =
    neighborIndexes(size, i)
    .reduce((count, neighborIndex)=>{
      return count + (initialField[neighborIndex].mine ? 1 : 0);
    }, 0);
}
function updateCell(field, i, props){
  return [
    ...field.slice(0, i),
    Object.assign({}, field[i], props),
    ...field.slice(i+1)
  ];
}
function revealCells(field, indexes){
  return indexes.reduce((newField, index)=>{
    if (newField[index].revealed) return newField;
    return updateCell(newField, index, {
      revealed: true,
      flagged: false
    });
  }, field);
}
export default function field(field=initialField, action){
  switch (action.type){
    case REVEAL:
      return revealCells(field, action.indexes);

    case FLAG:
      return updateCell(field, action.index, {
        flagged: true
      });

    case UNFLAG:
      return updateCell(field, action.index, {
        flagged: false
      });

    default:
      return field;
  }
}
