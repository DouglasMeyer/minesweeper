export const fieldSize = 10;

export function neighborIndexes(size, index){
  const leftNeighbors  = [ index - size - 1, index - 1, index + size - 1 ];
  const rightNeighbors = [ index - size + 1, index + 1, index + size + 1 ];
  return [
    ...(index % size !== 0 ? leftNeighbors : []),
    ...(index % size !== size - 1 ? rightNeighbors : []),
    ...[ index - size, index + size ]
  ].filter(i => i >= 0 && i < size * size);
}

const square = [-1, 0, 1].reduce((square, y) =>
  square.concat([-1, 0, 1].map(x => ({ x, y })))
, []);
export const nineSquare = [4, 1, 2, 5, 8, 7, 6, 3, 0].map(i => square[i]);

export function cellAt(fields, x, y){
  const fx = Math.floor(x / fieldSize);
  const fy = Math.floor(y / fieldSize);
  const field = fields.find(field => {
    return field.position.x === fx && field.position.y === fy;
  });
  if (!field) return;
  return field.cells[(y - fy * fieldSize) * fieldSize + (x - fx * fieldSize)];
}
