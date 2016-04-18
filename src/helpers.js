export function neighborIndexes(size, index){
  return [
    ...(index % size !== 0      ? [ index-size-1, index-1, index+size-1 ] : []),
    ...(index % size !== size-1 ? [ index-size+1, index+1, index+size+1 ] : []),
    ...[ index-size, index+size ]
  ].filter(i => i >= 0 && i < size*size);
}
