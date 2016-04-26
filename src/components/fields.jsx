/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|Field)$" }]*/
import React, { PropTypes, Component } from 'react';

import Field from './field.jsx';

const _onResize = Symbol('onResize');
class Fields extends Component {
  constructor(){
    super();
    this.state = { size: { width: 800, height: 600 } };
    this[_onResize] = this[_onResize].bind(this);
  }

  componentWillMount(){
    this[_onResize]();
  }

  componentDidMount(){
    window.addEventListener('resize', this[_onResize]);
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this[_onResize]);
  }

  [_onResize](){
    this.setState({
      size: {
        width: document.body.clientWidth,
        height: document.body.clientHeight
      }
    });
  }

  render(){
    const { fields, position, onReveal, onFlag, onUnflag } = this.props;
    const { size } = this.state;
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
