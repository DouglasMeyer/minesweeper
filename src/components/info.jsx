/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(React|Field)$" }]*/
import React, { PropTypes, Component } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

class Info extends Component {
  constructor(){
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render(){
    const { info } = this.props;
    const total = <div>Total cells revealed: { info.reduce((a, i) => a + i.reveals, 0) }</div>;
    const safely = <div>Cells safely revealed: { info[0].reveals }</div>;
    const history = <ol
      className='info_list'
      onWheel={ e => e.stopPropagation() }
      ref={ el => { console.log(el); if (el){ el.scrollTop = 999999; } } }
    >
      { info.slice(1).reverse().map(({reveals}, i) => <li key={i}>{ reveals }</li>)}
    </ol>;

    return <div className='info'>
      { info.length > 1 ? history : false }
      { total }
      { info.length > 1 ? safely : false }
    </div>;
  }
}

Info.propTypes = {
  info: PropTypes.arrayOf(PropTypes.shape({
    reveals: PropTypes.number.isRequired
  }).isRequired).isRequired
};
export default Info;
