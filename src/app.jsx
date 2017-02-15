/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|Fields|Info)$" }] */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Fields from './components/fields.jsx';
import Info from './components/info.jsx';
import { PeerIntegration } from './peer_integration';
import { Routing } from './routing';
import { reveal, flag, unflag, keyDown, keyUp, scroll } from './actions';

export default class App extends Component {
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
    const { gameOverMove, seed } = info;

    return <div
      className={ `app${gameOverMove ? ' app-is_game_over' : ''}` }
      tabIndex={0}
      ref={ el => el && el.focus() }
      onKeyDown={ e =>{
        if (e.target.nodeName === "INPUT") return;
        onKeyDown(e.nativeEvent.code || e.nativeEvent.key);
      } }
      onKeyUp={ e => onKeyUp(e.nativeEvent.code || e.nativeEvent.key) }
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
        onFlag={ onFlag.bind(null, seed) }
        onUnflag={ onUnflag.bind(null, seed) }
      ></Fields>
      <PeerIntegration />
      <Routing />
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
