import { REVEAL, FLAG, UNFLAG } from '../actions';

function newCell(){
  return { mine: Math.random() < 1/5 };
}
const size = 20;
const initialField = []
for (let y=0; y<size; y++){
  const row = [];
  initialField.push(row);
  for (let x=0; x<size; x++){
    row.push(newCell());
  }
}
for (let y=0; y<size; y++){
  let row = initialField[y];
  for (let x=0; x<size; x++){
    let currentCell = row[x];
    currentCell.neighboringMineCount = 0;
    initialField.forEach((row, rowIndex)=>{
      if (Math.abs(y - rowIndex) > 1) return;
      row.forEach((cell, cellIndex)=>{
        if (Math.abs(x - cellIndex) > 1) return;
        if (cell.mine) currentCell.neighboringMineCount += 1;
      });
    });
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

  return updateCell(field, x, y, {
    revealed: true,
    flagged: false
  });
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
