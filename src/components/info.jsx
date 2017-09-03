/* eslint-env browser */
import React, { PropTypes, PureComponent as Component } from 'react'; // eslint-disable-line react/no-deprecated
import { connect } from 'react-redux';
import { newGame, nextMap, joinGame } from '../actions';
import firebase from '../firebase';
require('./info.css');

const CurrentGamePanel = connect(
  ({ info: {
    bestHardcore: best,
    game: {
      id,
      map: { revealCount: score },
    }
  } }) => ({
    score, best, gameId: id
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
      gameId: PropTypes.string,
      onNextMap: PropTypes.func.isRequired,
      onChangePannel: PropTypes.func.isRequired
    }
    render(){
      const { score, best, gameId, onNextMap, onChangePannel } = this.props;
      return <div className='currentGame info rows'>
        <div className="cols">
          <button onClick={() => onNextMap()}>next map</button>
          <a onClick={function(){ onChangePannel('new_game'); }}>new game</a>
          <a onClick={function(){ onChangePannel('join_game'); }}>join game</a>
        </div>
        { gameId &&
          <a
            href={`${location.origin}${location.pathname}#joinGame=${gameId}`}
            onClick={function(e){
              e.preventDefault();
              alert("Right-click to copy link/address.");
            }}
          >Share game link</a>
        }
        <div style={{ marginTop: '5px', textAlign: 'right' }}>
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

const JoinGamePanel = connect(
  () => ({}),
  (dispatch, props) => ({
    onChangePanel: props.onChangePanel,
    onJoinGame: opts => dispatch(joinGame(opts))
  })
)(
  class extends Component {
    static displayName = "JoinGamePanel"
    static propTypes = {
      onJoinGame: PropTypes.func.isRequired,
      onChangePannel: PropTypes.func.isRequired
    }
    componentDidMount(){
      this.gamesRef = firebase.database().ref().child('games');
      this.gamesRef.on('value', snapshot => {
        const games = snapshot.val();
        this.setState({ games });
      });
    }
    componentWillUnmount(){
      this.gamesRef.off();
    }

    onJoinGame = gameId => {
      const { onJoinGame, onChangePannel } = this.props;
      onJoinGame(gameId);
      onChangePannel('current_game');
    }

    render(){
      const { onChangePannel } = this.props;
      const { games } = this.state;

      return <div className='info rows'>
        { games
          ? <div>
              { Object.keys(games).map(gameId => {
                const game = games[gameId];
                return <div key={gameId} className="cols">
                  <div>
                    Map count: {Object.keys(game.maps).length}
                    {' '}
                    {[
                      game.isPractice && 'practice',
                      game.safeStart && 'safe start'
                    ].filter(x => x).join(' ')}
                  </div>
                  <button onClick={() => this.onJoinGame(gameId)}>join game</button>
                </div>;
              }) }
            </div>
          : <div>Loading games</div>
        }
        <div className="cols">
          <a onClick={() => onChangePannel('current_game')}>cancel</a>
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
      { currentPanel === 'join_game' &&
        <JoinGamePanel
          onChangePannel={currentPanel => { this.setState({ currentPanel }); }}
        />
      }
    </div>;
  }
}
