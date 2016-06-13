/* eslint-env browser */
/* global ga */
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|RevealSummary|History)$" }]*/
import React, { PropTypes, Component } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
require('./info.css');

function RevealSummary({ bestHardcore, reveals }){
  const current = reveals[0];
  const bestReveal = Math.max.apply(null, reveals);
  const total = reveals.reduce((s, r) => s + r);
  const summaryExtra = <small>
    &nbsp;
    &lt; { bestHardcore || bestReveal }
    { bestHardcore ? false : ' = '+total }
  </small>;

  let label = 'current';
  if (bestHardcore) {
    label += ' < best';
  } else if (reveals.length > 1) {
    label += ' < best = total';
  }

  return <div className='info_summary'>
    <small>{ label }</small>
    <div>
      Squares revealed: { current }
      { bestHardcore || reveals.length > 1 ? summaryExtra : false }
    </div>
  </div>;
}
RevealSummary.propTypes = {
  bestHardcore: PropTypes.number,
  reveals: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired
};

function History({ reveals }){
  if (reveals.length === 1) return null;

  return <div>
    Previous runs:
    <ol
      className='info_list'
      onWheel={ e => e.stopPropagation() }
      ref={ el => { if (el){ el.scrollTop = 999999; } } }
    >
      { reveals.slice(1).reverse().map((n, i) => <li key={i}>{ n }</li>)}
    </ol>
  </div>;
}

class Info extends Component {
  constructor(){
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount(){
    this.revealIfSafeStart();
    this.setState(this.props.options);
  }

  toggleSafeStart(){
    const { safeStart } = this.state;
    this.setState({ safeStart: !safeStart }, this.updateHash);
  }

  toggleHardcore(){
    const { hardcore } = this.state;
    this.setState({ hardcore: !hardcore }, this.updateHash);
  }

  updateHash(){
    location.hash = Object.keys(this.state)
      .filter(k => this.state[k])
      .join(',');
  }

  onNewGame(){
    this.props.onNewGame();
    setTimeout(this.revealIfSafeStart.bind(this));
  }

  revealIfSafeStart(){
    ga('send', 'event', 'Game', 'start', location.hash);
    const { onRevealSafe } = this.props;
    const { safeStart } = this.props.options;

    if (safeStart) onRevealSafe();
  }

  render(){
    if (!this.state) return null;
    const { bestHardcore, reveals, options } = this.props;
    const { safeStart, hardcore } = this.state;
    const optionsChanged = Object.keys(options).some(k => options[k] !== this.state[k]);
    let newGame = <small>
      <a onClick={ this.onNewGame.bind(this) }>Start a new game</a>.
    </small>;
    if (optionsChanged){
      newGame = <small>
        To use these settings&nbsp;
        <a onClick={ this.onNewGame.bind(this) }>start a new game</a>
        .
      </small>;
    }

    return <div className='info'>
      <RevealSummary reveals={reveals} bestHardcore={hardcore ? bestHardcore : null}></RevealSummary>
      <History reveals={reveals}></History>
      { newGame }
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        height: '1.5rem'
      }}>
        <label className='option'><input type='checkbox' checked={ safeStart } onChange={ this.toggleSafeStart.bind(this) } />Safe start</label>
        <label className='option'><input type='checkbox' checked={ hardcore } onChange={ this.toggleHardcore.bind(this) } />Hardcore</label>
      </div>
    </div>;
  }
}

Info.propTypes = {
  bestHardcore: PropTypes.number,
  reveals: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  options: PropTypes.shape({
    safeStart: PropTypes.boolean,
    hardcore: PropTypes.boolean
  }).isRequired,
  onNewGame: PropTypes.func.isRequired,
  onRevealSafe: PropTypes.func.isRequired
};
export default Info;
