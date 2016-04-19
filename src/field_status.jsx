import React, { PropTypes } from 'react';

function FieldStatus({ field, position }){
  let mineCount = 0,
      flagCount = 0;
  field.forEach(cell=>{
    if (cell.mine && !cell.revealed) mineCount += 1;
    if (cell.flagged) flagCount += 1;
  });
  const flagsLeft = mineCount - flagCount;
  return <div>
    Flags left for area: { flagsLeft }
    { position.x }, { position.y }
  </div>;
}
FieldStatus.propTypes = {
  field: PropTypes.array.isRequired
};

export default FieldStatus;
