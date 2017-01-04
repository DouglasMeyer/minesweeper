/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|Field)$" }]*/
import React, { PropTypes, Component } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Field from './field.jsx';
import { fieldSize } from '../helpers';
require('./fields.css');

const _onResize = Symbol('onResize');
class Fields extends Component {
  constructor(){
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
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
    const scale = 24; // FIXME: magic number
    const top = size.height / 2 - position.y - (fieldSize / 2 + 0.5) * scale * 2;
    const left = size.width / 2 - position.x - (fieldSize / 2 + 0.5) * scale * 2;
    const minX = Math.floor((position.x - size.width / 2) / (fieldSize * scale * 2));
    const maxX = Math.ceil((position.x + size.width / 2) / (fieldSize * scale * 2));
    const minY = Math.floor((position.y - size.height / 2) / (fieldSize * scale * 2));
    const maxY = Math.ceil((position.y + size.height / 2) / (fieldSize * scale * 2));
    const visibleFields = fields.filter(field =>
      field.position.x >= minX && field.position.x <= maxX &&
      field.position.y >= minY && field.position.y <= maxY
    );

    return <div
      className='fields'
      style={{
        position: 'absolute',
        willChange: 'transform, transform-origin',
        transform: `translate(${left}px, ${top}px)`
      }}
    >
      { visibleFields.map(field => {
        return <Field
          key={`${field.position.x}-${field.position.y}`}
          {...field}
          size={fieldSize /* FIXME: magic number */}
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
