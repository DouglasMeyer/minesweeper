import React, { PropTypes } from 'react';

function FieldStatus({ field }){
  let mineCount = 0,
      flagCount = 0;
  field.forEach((row)=>{
    row.forEach((cell)=>{
      if (cell.mine && !cell.revealed) mineCount += 1;
      if (cell.flagged) flagCount += 1;
    });
  });
  const flagsLeft = mineCount - flagCount;
  return <div>
    Flags left for area: { flagsLeft }
  </div>;
}
FieldStatus.propTypes = {
  field: PropTypes.array.isRequired
};

export default FieldStatus;
