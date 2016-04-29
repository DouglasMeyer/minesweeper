/* eslint-env browser */
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|RevealSummary)$" }]*/
import React, { PropTypes, Component } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

function RevealSummary({ reveals }){
  const current = reveals[0];
  const best = Math.max.apply(null, reveals);
  const total = reveals.reduce((s, r) => s + r);
  const summaryExtra = <small>
    &nbsp;
    &lt; { best }&nbsp;&nbsp;= { total }
  </small>;

  return <div className='info_summary'>
    <small>
      current{ reveals.length > 1 ? ' < best = total' : false }
    </small>
    <div>
      Squares revealed: { current }
      { reveals.length > 1 ? summaryExtra : false }
    </div>
  </div>;
}

class Info extends Component {
  constructor(){
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = {};
  }

  componentDidMount(){
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

  render(){
    const { reveals, options } = this.props;
    const { safeStart, hardcore } = this.state;
    const history = <div>
      Previous runs:
      <ol
        className='info_list'
        onWheel={ e => e.stopPropagation() }
        ref={ el => { if (el){ el.scrollTop = 999999; } } }
      >
        { reveals.slice(1).reverse().map((n, i) => <li key={i}>{ n }</li>)}
      </ol>
    </div>;
    const optionsChanged = Object.keys(options).some(k => options[k] !== this.state[k]);
    const reload = <small>
      Reload to use these settings.
    </small>;

    return <div className='info'>
      <RevealSummary reveals={reveals}></RevealSummary>
      { reveals.length > 1 ? history : false }
      { optionsChanged ? reload : false }
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        height: '1.5rem'
      }}>
        <label className='option'><input type='checkbox' checked={ safeStart || false } onChange={ this.toggleSafeStart.bind(this) } />Safe start</label>
        <label className='option'><input type='checkbox' checked={ hardcore || false } onChange={ this.toggleHardcore.bind(this) } />Hardcore</label>
      </div>
    </div>;
  }
}

Info.propTypes = {
  reveals: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  options: PropTypes.shape({
    safeStart: PropTypes.boolean,
    hardcore: PropTypes.boolean
  }).isRequired
};
export default Info;
