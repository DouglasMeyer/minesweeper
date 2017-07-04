/* globals describe it before after */
import reducers from '.';

var assert = require('assert');

function seed(num){
  return String.fromCharCode.apply(0, new Array(256).fill(num));
}
describe('reducers', function(){
  let seedId = 34;
  before(function(){
    global.localStorage = { getItem: () => 8 };
    global.crypto = { getRandomValues: array => array.fill(++seedId) };
  });
  after(function(){
    delete global.localStorage;
    delete global.crypto;
  });

  describe('init', function(){
    it('sets currentGame and nextGames', function(){
      const state = reducers({}, {});
      assert.deepEqual(state.info, {
        bestHardcore: 8,
        peerId: 'solo',
        previousGames: [],
        currentGame: {
          gameMode: 'normal',
          safeStart: false,
          reveals: { solo: { count: 0, isGameOver: false } },
          seed: seed(seedId-1)
        },
        nextGames: [ {
          gameMode: 'normal',
          safeStart: false,
          reveals: { solo: { count: 0, isGameOver: false } },
          seed: seed(seedId)
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
