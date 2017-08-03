/* eslint-env browser */
/* global ga */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { revealSafe, newGame, setNextGameMode, setNextSafeStart } from '../actions';
require('./info.css');

function RevealSummary({ best, score }){
  const top = best ? <small>best: { best }</small> : false;
  return <div className='info_summary'>
    <div>Score: { score } { top }</div>
  </div>;
}
RevealSummary.propTypes = {
  best: PropTypes.number,
  score: PropTypes.number.isRequired
};

class Info extends Component {
  static get propTypes(){
    return {
      bestHardcore: PropTypes.number,
      revealCount: PropTypes.number.isRequired,
      safeStart: PropTypes.bool.isRequired,
      isPractice: PropTypes.bool.isRequired,
      onNewGame: PropTypes.func.isRequired,
      onRevealSafe: PropTypes.func.isRequired
    };
  }

  constructor(props){
    super(props);
    const { safeStart, isPractice } = props;
    this.state = { safeStart, isPractice };
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount(){
    setTimeout(()=> this.revealIfSafeStart());
  }

  onNewGame(){
    const { safeStart, isPractice } = this.state;
    this.props.onNewGame({ safeStart, isPractice });
    setTimeout(this.revealIfSafeStart.bind(this));
  }

  revealIfSafeStart(){
    ga('send', 'event', 'Game', 'start', location.hash);
    const { onRevealSafe, safeStart } = this.props;

    if (safeStart) onRevealSafe();
  }

  render(){
    const {
      bestHardcore, revealCount
    } = this.props;
    const { safeStart, isPractice } = this.state;

    const optionsChanged =
      safeStart !== this.props.safeStart ||
      isPractice !== this.props.isPractice;
    let newGame = <small>
      <a onClick={ this.onNewGame.bind(this) }>Start next map</a>.
    </small>;
    if (optionsChanged){
      newGame = <small>
        To use these settings&nbsp;
        <a onClick={ this.onNewGame.bind(this) }>start a new game</a>
        .
      </small>;
    }

    return <div className='info'>
      <RevealSummary score={revealCount} best={bestHardcore} />
      { newGame }
      <label className='option'><input type='checkbox' checked={ safeStart } onChange={ () => { this.setState({ safeStart: !safeStart }); } } />Safe start</label>
      <div className="info_gameMode">
        <div className="info_gameMode_modes">
          <h5 className={ !isPractice ? "selected" : "" }
            onClick={ () => { this.setState({ isPractice: false }); } }
          >Normal</h5>
          <h5 className={ isPractice ? "selected" : "" }
            onClick={ () => { this.setState({ isPractice: true }); } }
          >Practice</h5>
        </div>
        <div className="info_gameMode_description">{
          isPractice
            ? 'When you hit a mine, you can keep going.'
            : 'Play until you hit a mine.'
        }</div>
      </div>
    </div>;
  }
}
const connectedInfo = connect(
  ({
    info: {
      bestHardcore,
      map: { revealCount, safeStart, isPractice }
    }
  }) => ({
    bestHardcore,
    revealCount,
    safeStart,
    isPractice
  }),
  dispatch => ({
    onRevealSafe: () => dispatch(revealSafe()),
    onNewGame: options => dispatch(newGame(options)),
    onSetNextGameMode: gameMode => dispatch(setNextGameMode(gameMode)),
    onSetNextSafeStart: safeStart => dispatch(setNextSafeStart(safeStart))
  })
)(Info);
export default connectedInfo;
