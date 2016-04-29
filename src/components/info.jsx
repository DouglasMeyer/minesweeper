/* eslint-env browser */
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|RevealSummary)$" }]*/
import React, { PropTypes, Component } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

function RevealSummary({ info }){
  const reveals = info.map(i => i.reveals);
  const current = reveals[0];
  const best = Math.max.apply(null, reveals);
  const total = reveals.reduce((s, r) => s + r);
  const summaryExtra = <small>
    &nbsp;
    &lt; { best }&nbsp;&nbsp;= { total }
  </small>;

  return <div className='info_summary'>
    <small>
      current{ info.length > 1 ? ' < best = total' : false }
    </small>
    <div>
      Squares revealed: { current }
      { info.length > 1 ? summaryExtra : false }
    </div>
  </div>;
}

class Info extends Component {
  constructor(){
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = location.hash
      .slice(1)
      .split(',')
      .filter(e => e)
      .reduce((state, key) => {
        return Object.assign({}, state, {
          [key]: true
        });
      }, {});
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
    const { info } = this.props;
    const { safeStart, hardcore } = this.state;
    const history = <div>
      Previous runs:
      <ol
        className='info_list'
        onWheel={ e => e.stopPropagation() }
        ref={ el => { if (el){ el.scrollTop = 999999; } } }
      >
        { info.slice(1).reverse().map(({reveals}, i) => <li key={i}>{ reveals }</li>)}
      </ol>
    </div>;

    return <div className='info'>
      <RevealSummary info={info}></RevealSummary>
      { info.length > 1 ? history : false }
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
  info: PropTypes.arrayOf(PropTypes.shape({
    reveals: PropTypes.number.isRequired
  }).isRequired).isRequired
};
export default Info;
