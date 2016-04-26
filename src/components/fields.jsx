/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|Field)$" }]*/
import React, { PropTypes } from 'react';

import Field from './field.jsx';

function Fields({ fields, position, size, onReveal, onFlag, onUnflag }){
  const fieldSize = 10; // FIXME: Magic number

  return <div
    style={{
      position: 'absolute',
      willChange: 'top, left',
      top: size.height / 2 - position.y - (fieldSize / 2 + 0.5) * 16 * 2,
      left: size.width / 2 - position.x - (fieldSize / 2 + 0.5) * 16 * 2
    }}
  >
    { fields.map(field => {
      return <Field
        key={`${field.position.x}-${field.position.y}`}
        {...field}
        size={10 /* FIXME: magic number */}
        onReveal={ onReveal }
        onFlag={ onFlag }
        onUnflag={ onUnflag }
      ></Field>;
    })}
  </div>;
}
Fields.propTypes = {
  fields: PropTypes.array.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  }),
  onReveal: PropTypes.func.isRequired,
  onFlag: PropTypes.func.isRequired,
  onUnflag: PropTypes.func.isRequired
};

export default Fields;
