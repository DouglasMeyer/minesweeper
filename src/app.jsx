/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|Fields|Info)$" }]*/
import React, { Component } from 'react';
import { connect } from 'react-redux';

import Fields from './components/fields.jsx';
import Info from './components/info.jsx';
import { reveal, flag, unflag, keyDown, keyUp, scroll } from './actions';

export default class App extends Component {
  onWheel(e){
    this.props.onScroll({ dx: e.deltaX, dy: e.deltaY });
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
    const { pageX, pageY } = e.changedTouches[0];
    this.lastTouch = { x: pageX, y: pageY };
    this.props.onScroll({
      dx: x - pageX,
      dy: y - pageY
    });
  }

  render(){
    const {
      fields, position, info,
      onReveal, onFlag, onUnflag,
      onKeyDown, onKeyUp
    } = this.props;

    return <div
      className='app'
      tabIndex={0}
      ref={ el => el && el.focus() }
      onKeyDown={ e => onKeyDown(e.nativeEvent.code) }
      onKeyUp={ e => onKeyUp(e.nativeEvent.code) }
      onWheel={ this.onWheel.bind(this) }
      onTouchStart={ this.onTouchStart.bind(this) }
      onTouchMove={ this.onTouchMove.bind(this) }
      onTouchEnd={ this.onTouchEnd.bind(this) }
    >
      <Info info={ info }></Info>
      <Fields
        fields={ fields }
        position={ position }
        onReveal={ onReveal }
        onFlag={ onFlag }
        onUnflag={ onUnflag }
      ></Fields>
    </div>;
  }
}

export default connect(
  state => ({
    fields: state.fields,
    position: state.tracking.position,
    info: state.info
  }),
  dispatch => ({
    onReveal: pos => dispatch(reveal(pos)),
    onFlag: pos => dispatch(flag(pos)),
    onUnflag: pos => dispatch(unflag(pos)),
    onKeyDown: k => dispatch(keyDown(k)),
    onKeyUp: k => dispatch(keyUp(k)),
    onScroll: posD => dispatch(scroll(posD))
  })
)(App);
