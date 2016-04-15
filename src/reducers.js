import { combineReducers } from 'redux';

import { REVEAL, FLAG, UNFLAG } from './actions';

function newCell(){
  return { mine: Math.random() < 1/4 };
}
const size = 10;
const initialField = []
for (let y=0; y<size; y++){
  let row = [];
  initialField.push(row);
  for (let x=0; x<size; x++){
    row.push(newCell());
  }
}
function updateCell(field, x, y, props){
  return field.map((row,ri)=>{
    if (ri === y){
      return row.map((cell, ci)=>{
        if (ci === x){
          return Object.assign({}, cell, props);
        }
        return cell;
      });
    }
    return row;
  });
}
function field(field=initialField, action){
  switch (action.type){
    case REVEAL:
      const neighboringMineCount = field.reduce((sum, row, rowIndex)=>{
        if (Math.abs(action.y - rowIndex) > 1) return sum;
        return sum + row.reduce((sum, cell, cellIndex)=>{
          if (Math.abs(action.x - cellIndex) > 1) return sum;
          if (cell.mine) return sum + 1;
          return sum;
        }, 0);
      }, 0);

      return updateCell(field, action.x, action.y, {
        revealed: true,
        neighboringMineCount: neighboringMineCount
      });

    case FLAG:
      return updateCell(field, action.x, action.y, {
        flagged: true
      });

    case UNFLAG:
      return updateCell(field, action.x, action.y, {
        flagged: false
      });

    default:
      return field;
  }
}

export default combineReducers({
  field
});
