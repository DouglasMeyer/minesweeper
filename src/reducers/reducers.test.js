/* eslint-env mocha */
import reducers from '.';

var assert = require('assert');

describe('reducers', function(){
  describe('init', function(){
    it('sets info', function(){
      const state = reducers({}, {});
      delete state.info.map.seed;
      assert.deepEqual(state.info, {
        bestHardcore: null,
        map: {
          exploded: false,
          isPractice: false,
          safeStart: false,
          revealCount: 0
        }
      });
    });
  });

  describe('NEW_GAME', function(){
    it('sets info.map', function(){
      const oldState = { info: {
        bestHardcore: 8,
        map: { seed: "???", exploded: true, isPractice: true, safeStart: false, revealCount: 100 }
      }};
      const state = reducers(oldState, { type: 'NEW_GAME', isPractice: false, safeStart: true });

      delete state.info.map.seed;
      assert.deepEqual(state.info, {
        bestHardcore: 8,
        map: {
          exploded: false,
          isPractice: false,
          safeStart: true,
          revealCount: 0
        }
      });
    });
  });
});
