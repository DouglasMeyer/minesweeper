/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|Fields|Info)$" }] */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Fields from './components/fields.jsx';
import Info from './components/info.jsx';
import { reveal, flag, unflag, keyDown, keyUp, scroll } from './actions';

class App extends Component {
  static get propTypes(){
    const func = PropTypes.func.isRequired;
    return {
      fields: PropTypes.array.isRequired,
      position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
      }).isRequired,
      info: PropTypes.object.isRequired,
      onScroll: func,
      onReveal: func,
      onFlag: func,
      onUnflag: func,
      onKeyDown: func,
      onKeyUp: func
    };
  }

  constructor(){
    super();
    this.onFlag = this.onFlag.bind(this);
    this.onUnflag = this.onUnflag.bind(this);
  }

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

  componentDidMount(){
    this.refs.root.focus();
  }

  onFlag(){
    const { onFlag, info: { map: { seed } } } = this.props;
    onFlag(seed, ...arguments);
  }

  onUnflag(){
    const { onUnflag, info: { map: { seed } } } = this.props;
    onUnflag(seed, ...arguments);
  }

  render(){
    const {
      fields, position, info,
      onReveal,
      onKeyDown, onKeyUp
    } = this.props;
    const { map: { exploded } } = info;

    return <div
      className={ `app${exploded ? ' app-is_game_over' : ''}` }
      onBlur={ e=> setTimeout(()=> e.target.focus()) }
      tabIndex={0}
      ref="root"
      onKeyDown={ e =>{
        if (e.target.nodeName === "INPUT") return;
        onKeyDown(e);
      } }
      onKeyUp={ onKeyUp }
      onWheel={ this.onWheel.bind(this) }
      onTouchStart={ this.onTouchStart.bind(this) }
      onTouchMove={ this.onTouchMove.bind(this) }
      onTouchEnd={ this.onTouchEnd.bind(this) }
    >
      <Info />
      <Fields
        fields={ fields }
        position={ position }
        onReveal={ onReveal }
        onFlag={ this.onFlag }
        onUnflag={ this.onUnflag }
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
    onFlag: (seed, pos) => dispatch(flag(seed, pos)),
    onUnflag: (seed, pos) => dispatch(unflag(seed, pos)),
    onKeyDown: k => dispatch(keyDown(k)),
    onKeyUp: k => dispatch(keyUp(k)),
    onScroll: posD => dispatch(scroll(posD))
  })
)(App);
