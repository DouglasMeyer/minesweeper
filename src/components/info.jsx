/* eslint-env browser */
/* global ga */
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
History.propTypes = {
  reveals: PropTypes.array.isRequired
};

class Info extends Component {
  constructor(){
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    setTimeout(()=>{
      this.setState({
        options: this.props.options,
        mapKey: this.props.seed
      });
    });
  }

  componentDidMount(){
    this.revealIfSafeStart();
  }

  toggleSafeStart(){
    const { options } = this.state;
    const { safeStart } = options;
    this.setState({
      options: Object.assign({}, options, {
        safeStart: !safeStart
      })
    }, this.updateHash);
  }

  toggleHardcore(){
    const { options } = this.state;
    const { hardcore } = options;
    this.setState({
      options: Object.assign({}, options, {
        hardcore: !hardcore
      })
    }, this.updateHash);
  }

  toggleFixedSeed(){
    const { options, mapKey: currentMapKey } = this.state;
    const { mapKey } = options;
    this.setState({
      options: Object.assign({}, options, {
        mapKey: mapKey ? null : currentMapKey
      })
    }, this.updateHash);
  }

  updateMapKey(e){
    const { options } = this.state;
    this.setState({
      options: Object.assign({}, options, {
        mapKey: e.target.value
      })
    }, this.updateHash);
  }

  updateHash(){
    const { options } = this.state;
    location.hash = Object.keys(options)
      .filter(k => options[k])
      .map(k => options[k] === true ? k : `${k}=${options[k]}`)
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
    const { bestHardcore, reveals, options, seed: currentMapKey } = this.props;
    const { options: { safeStart, hardcore, mapKey } } = this.state;
    const optionsChanged =
      options.safeStart !== safeStart ||
      options.hardcore !== hardcore ||
      (mapKey && currentMapKey !== mapKey);
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
        <label className='option'><input type='checkbox' checked={ !!mapKey } onChange={ this.toggleFixedSeed.bind(this) } />Use map key:&nbsp;</label>
        <input disabled={ !mapKey } value={ mapKey || currentMapKey } onChange={ this.updateMapKey.bind(this) } />
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
  seed: PropTypes.string.isRequired,
  onNewGame: PropTypes.func.isRequired,
  onRevealSafe: PropTypes.func.isRequired
};
export default Info;
