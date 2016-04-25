export function neighborIndexes(size, index){
  const leftNeighbors  = [ index - size - 1, index - 1, index + size - 1 ];
  const rightNeighbors = [ index - size + 1, index + 1, index + size + 1 ];
  return [
    ...(index % size !== 0 ? leftNeighbors : []),
    ...(index % size !== size - 1 ? rightNeighbors : []),
    ...[ index - size, index + size ]
  ].filter(i => i >= 0 && i < size * size);
}

export const nineSquare = [
  { x: -1, y: -1 }, { x:  0, y: -1 }, { x:  1, y: -1 },
  { x: -1, y:  0 }, { x:  0, y:  0 }, { x:  1, y:  0 },
  { x: -1, y:  1 }, { x:  0, y:  1 }, { x:  1, y:  1 }
];
