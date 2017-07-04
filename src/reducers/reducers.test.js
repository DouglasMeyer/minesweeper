/* globals describe it before after */
import reducers from '.';

var assert = require('assert');

function seed(num){
  return String.fromCharCode.apply(0, new Array(256).fill(num));
}
describe('reducers', function(){
  describe('init', function(){
    it('sets currentGame and nextGames', function(){
      const state = reducers({}, {});
      assert.deepEqual(state.info, {
        bestHardcore: null,
        map: {
          exploded: false,
          isPractice: false,
          safeStart: false,
          reveals: { solo: { count: 0, isGameOver: false } }
        },
        nextGames: [ {
          gameMode: 'normal',
          safeStart: false,
          reveals: { solo: { count: 0, isGameOver: false } }
        } ]
      });
    });
  });

  describe('NEW_GAME', function(){
    it('sets currentGame to the nextGame and ensures nextGames', function(){
      const gameMode = 'normal';
      const safeStart = false;
      const reveals = { solo: { count: 0, isGameOver: false } };
      const oldState = { info: {
        bestHardcore: 8,
        peerId: 'solo',
        previousGames: [],
        currentGame: { gameMode, safeStart, reveals, seed: seed(35) },
        nextGames: [ { gameMode, safeStart, reveals, seed: seed(36) } ]
      }};
      const state = reducers(oldState, { type: 'NEW_GAME' });

      assert.deepEqual(state.info.previousGames, [ oldState.info.currentGame ]);
      assert.deepEqual(state.info.currentGame, oldState.info.nextGames[0]);
      assert.deepEqual(state.info.nextGames, [
        { gameMode, safeStart, reveals, seed: seed(seedId) }
      ]);
    });
  });
});
