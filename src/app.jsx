/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|Fields)$" }]*/
import React, { Component } from 'react';
import { connect } from 'react-redux';

import Fields from './components/fields.jsx';
import { reveal, flag, unflag, keyDown, keyUp } from './actions';

const _onResize = Symbol('onResize');
export default class App extends Component {
  constructor(){
    super();
    this.state = {
      position: { x: 0, y: 0 },
      size: { width: 800, height: 600 }
    };
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

  onWheel(e){
    const { position } = this.state;
    this.setState({
      position: {
        x: position.x + e.deltaX,
        y: position.y + e.deltaY
      }
    });
  }

  onTouchStart(e){
    const { pageX, pageY } = e.changedTouches[0];
    this.lastTouch = { x: pageX, y: pageY };
  }

  onTouchEnd(){
    this.lastTouch = null;
  }

  onTouchMove(e){
    e.preventDefault();
    const { x, y } = this.lastTouch;
    const { position } = this.state;
    const { pageX, pageY } = e.changedTouches[0];
    this.lastTouch = { x: pageX, y: pageY };
    this.setState({
      position: {
        x: position.x + (x - pageX),
        y: position.y + (y - pageY)
      }
    });
  }

  render(){
    const { fields, onReveal, onFlag, onUnflag, onKeyDown, onKeyUp } = this.props;
    const { position, size } = this.state;

    return <div
      className='app'
      tabIndex={1}
      onKeyDown={ e => onKeyDown(e.nativeEvent.code) }
      onKeyUp={ e => onKeyUp(e.nativeEvent.code) }
      onWheel={ this.onWheel.bind(this) }
      onTouchStart={ this.onTouchStart.bind(this) }
      onTouchMove={ this.onTouchMove.bind(this) }
      onTouchEnd={ this.onTouchEnd.bind(this) }
    >
      <Fields
        fields={ fields }
        position={ position }
        size={ size }
        onReveal={ onReveal }
        onFlag={ onFlag }
        onUnflag={ onUnflag }
      ></Fields>
    </div>;
  }
}

export default connect(
  state => ({
    fields: state.fields
  }),
  dispatch => ({
    onReveal: pos => dispatch(reveal(pos)),
    onFlag: pos => dispatch(flag(pos)),
    onUnflag: pos => dispatch(unflag(pos)),
    onKeyDown: k => dispatch(keyDown(k)),
    onKeyUp: k => dispatch(keyUp(k))
  })
)(App);
