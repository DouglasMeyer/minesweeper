import { REVEAL, FLAG, UNFLAG } from '../actions';

function newCell(){
  return { mine: Math.random() < 1/5 };
}
const size = 20;
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
function revealCell(field, x, y){
  if (!field[y] || !field[y][x]) return field;
  if (field[y][x].revealed) return field;

  let neighboringMineCount = 0;
  field.forEach((row, rowIndex)=>{
    if (Math.abs(y - rowIndex) > 1) return;
    row.forEach((cell, cellIndex)=>{
      if (Math.abs(x - cellIndex) > 1) return;
      if (cell.mine) neighboringMineCount += 1;
    });
  });

  let newField = updateCell(field, x, y, {
    revealed: true,
    neighboringMineCount: neighboringMineCount
  });
  if (neighboringMineCount === 0){
    return [
      { dx: -1, dy: -1 },
      { dx:  0, dy: -1 },
      { dx:  1, dy: -1 },
      { dx: -1, dy:  0 },
      { dx:  1, dy:  0 },
      { dx: -1, dy:  1 },
      { dx:  0, dy:  1 },
      { dx:  1, dy:  1 },
    ].reduce((field, {dx,dy})=> revealCell(field, x+dx, y+dy), newField);
  }
  return newField;
}
export default function field(field=initialField, action){
  switch (action.type){
    case REVEAL:
      return revealCell(field, action.x, action.y);

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
