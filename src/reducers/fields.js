import { REVEAL, FLAG, UNFLAG } from '../actions';
import fieldReducer from './field';
import { neighborIndexes, nineSquare } from '../helpers';

const frameSize = 10; // FIXME: Magic number
function createNewNeighbors(fields, field){
  return nineSquare
  .map(p => ({ x: field.position.x + p.x, y: field.position.y + p.y }))
  .map(p => {
    const field = fields.find(f => f.position.x === p.x && f.position.y === p.y);
    if (!field) return fieldReducer(undefined, { x: p.x * frameSize, y: p.y * frameSize });
  })
  .filter(e => e);
}

function ensureFieldWithNeighbors(field, fields){
  if (field.loaded) return field;
  const neighborFields = nineSquare
    .map(p => fields.find(f =>
      field.position.x + p.x === f.position.x &&
      field.position.y + p.y === f.position.y
    ))
    .filter(f => f);
  if (neighborFields.length !== 9) return field;
  let plusCells = [
    neighborFields[0].cells[frameSize * frameSize - 1],
    ...neighborFields[1].cells.slice(frameSize * (frameSize - 1), frameSize * frameSize),
    neighborFields[2].cells[frameSize * (frameSize - 1)]
  ];
  for (let i = 0; i < frameSize; i++) {
    plusCells = plusCells.concat([
      neighborFields[3].cells[frameSize * (i + 1) - 1],
      ...field.cells.slice(frameSize * i, frameSize * (i + 1)),
      neighborFields[5].cells[frameSize * i]
    ]);
  }
  plusCells = plusCells.concat([
    neighborFields[6].cells[frameSize - 1],
    ...neighborFields[7].cells.slice(0, frameSize),
    neighborFields[8].cells[0]
  ]);
  return Object.assign({}, field, {
    loaded: true,
    cells: plusCells.map((cell, cellIndex) => {
      const cellNeighborIndexes = neighborIndexes(frameSize + 2, cellIndex);
      if (cellNeighborIndexes.length !== 8) return;

      return Object.assign(cell, {
        neighboringMineCount: cellNeighborIndexes
          .reduce((count, neighborIndex) => {
            return count + (plusCells[neighborIndex].mine ? 1 : 0);
          }, 0)
      });
    }).filter(n => n)
  });
}

function defaultState(){
  return createNewNeighbors([], { position: { x: 0, y: 0 } });
}

export default function fields(oldState, action){
  const state = oldState || defaultState();
  switch (action.type){
    case REVEAL:
    case FLAG:
    case UNFLAG:
      const positionsByField = action.positions.reduce((acc, position) => {
        const fx = Math.floor(position.x / frameSize);
        const fy = Math.floor(position.y / frameSize);
        const field = state.find(field => field.position.x === fx && field.position.y === fy);
        if (!acc.has(field)) acc.set(field, []);
        const positions = acc.get(field);
        positions.push({ x: position.x - fx * frameSize, y: position.y - fy * frameSize });
        acc.set(field, positions);
        return acc;
      }, new Map());
      const newState = Array.from(positionsByField.keys())
      .filter(f => !f.loaded)
      .reduce((fields, fieldToLoad) => {
        return fields.concat(createNewNeighbors(fields, fieldToLoad));
      }, state);
      return newState.map((field, _fieldIndex, fields) => {
        if (positionsByField.has(field)) {
          return fieldReducer(ensureFieldWithNeighbors(field, fields), Object.assign({}, action, {
            positions: positionsByField.get(field),
            loaded: true
          }));
        }
        return field;
      });

    default:
      return state;
  }
}
