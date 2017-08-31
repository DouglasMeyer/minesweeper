/* eslint-env browser */
import React, { PropTypes, PureComponent as Component } from 'react'; // eslint-disable-line react/no-deprecated
import { connect } from 'react-redux';
import { newGame, nextMap } from '../actions';
require('./info.css');

const CurrentGamePanel = connect(
  ({ info: {
    bestHardcore: best,
    game: {
      map: { revealCount: score },
    }
  } }) => ({
    score, best
  }),
  (dispatch, props) => ({
    onNextMap(){ dispatch(nextMap()); },
    onChangePannel: props.onChangePannel
  })
)(
  class extends Component {
    static displayName = "CurrentGamePanel"
    static propTypes = {
      score: PropTypes.number.isRequired,
      best: PropTypes.number.isRequired,
      onNextMap: PropTypes.func.isRequired,
      onChangePannel: PropTypes.func.isRequired
    }
    render(){
      const { score, best, onNextMap, onChangePannel } = this.props;
      return <div className='currentGame info rows'>
        <div className="cols">
          <button onClick={() => onNextMap()}>next map</button>
          <a onClick={function(){ onChangePannel('new_game'); }}>new game</a>
        </div>
        <div style={{ textAlign: 'right' }}>
          Score: {score}
          <small> best: {best}</small>
        </div>
      </div>;
    }
  }
);

const NewGamePanel = connect(
  ({ info: { game: {
    kind, safeStart, isPractice
  } } }) => ({
    kind, safeStart, isPractice
  }),
  (dispatch, props) => ({
    onChangePanel: props.onChangePanel,
    onNewGame: opts => dispatch(newGame(opts))
  })
)(
  class extends Component {
    static displayName = "NewGamePanel"
    static propTypes = {
      kind: PropTypes.oneOf(['solo', 'public']).isRequired,
      safeStart: PropTypes.bool,
      isPractice: PropTypes.bool,
      onNewGame: PropTypes.func.isRequired,
      onChangePannel: PropTypes.func.isRequired
    }
    constructor(props){
      super(props);
      this.state = {
        kind: props.kind,
        safeStart: props.safeStart, isPractice: props.isPractice
      };
    }

    onNewGame = () => {
      const { onNewGame, onChangePannel } = this.props;
      const { kind, isPractice, safeStart } = this.state;
      onNewGame({ kind, isPractice, safeStart });
      onChangePannel('current_game');
    }

    render(){
      const { onChangePannel } = this.props;
      const { kind, safeStart, isPractice } = this.state;

      return <div className='info rows'>
        <div className="cols">
          <label><input type="radio" name="kind" checked={kind === 'solo'} onChange={() => this.setState({ kind: 'solo' })} />solo</label>
          <label><input type="radio" name="kind" checked={kind === 'public'} onChange={() => this.setState({ kind: 'public' })} />public</label>
        </div>
        <div className="cols">
          <label><input type="radio" name="is_practice" checked={!isPractice} onChange={() => this.setState({ isPractice: false })} />normal</label>
          <label><input type="radio" name="is_practice" checked={isPractice} onChange={() => this.setState({ isPractice: true })} />practice</label>
        </div>
        <label>Maps start with a safe spot
          <input type="checkbox" checked={safeStart} onChange={({ target: { checked: safeStart } }) => this.setState({ safeStart })} />
        </label>
        <div className="cols">
          <a onClick={() => onChangePannel('current_game')}>cancel</a>
          <button onClick={this.onNewGame}>start new game</button>
        </div>
      </div>;
    }
  }
);

export default class Info extends Component {
  state = { currentPanel: 'current_game' }

  render() {
    const { currentPanel } = this.state;

    return <div>
      { currentPanel === 'current_game' &&
        <CurrentGamePanel
          onChangePannel={currentPanel => { this.setState({ currentPanel }); }}
        />
      }
      { currentPanel === 'new_game' &&
        <NewGamePanel
          onChangePannel={currentPanel => { this.setState({ currentPanel }); }}
        />
      }
    </div>;
  }
}
