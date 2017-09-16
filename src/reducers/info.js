/* eslint-env browser */
import { REVEAL, NEW_GAME, NEW_MAP, SET_MAP, SET_PLAYER_ID } from '../actions';
import { cellAt, newSeed } from '../helpers';

function newGame({ kind, id, isPractice, safeStart }){
  return {
    kind, id, isPractice, safeStart,
    previousMaps: [],
    nextMaps: []
  };
}

function newMap({ id, seed=newSeed(), exploded=false }={}){
  return { id, seed, exploded, revealCount: 0 };
}

export default function info(_state, action){
  const state = (_state && _state.info) ? _state : Object.assign({}, _state, { info: { bestHardcore: 0 } });
  const r = {
    [NEW_GAME]: (state, { kind, id, isPractice, safeStart }) => Object.assign({}, state, {
      info: Object.assign({}, state.info, {
        game: newGame({ kind, id, isPractice, safeStart })
      })
    }),
    [NEW_MAP]: (state, { id, seed, exploded }) => {
      const { info: { game: { previousMaps, map, nextMaps } } } = state;
      const gameIds = [...previousMaps, map, ...nextMaps].filter(x => x).map(({ id }) => id);
      if (gameIds.indexOf(id) !== -1) return state;

      return Object.assign({}, state, {
        info: Object.assign({}, state.info, {
          game: Object.assign({}, state.info.game, {
            nextMaps: [
              ...state.info.game.nextMaps,
              newMap({ id, seed, exploded })
            ]
          })
        })
      });
    },
    [SET_MAP]: (state, { mapId }) => {
      const { info: { game: { previousMaps: oldPreviousMaps, map, nextMaps: oldNextMaps } } } = state;
      const maps = [ ...oldPreviousMaps, map, ...oldNextMaps ].filter(x => x);
      const setMap = maps.find(m => m.id === mapId || m.seed === mapId);
      const mapIndex = maps.indexOf(setMap);
      if (mapIndex === -1) return state;

      const previousMaps = maps.slice(0, mapIndex);
      const nextMaps = maps.slice(mapIndex + 1);

      return Object.assign({}, state, {
        info: Object.assign({}, state.info, {
          game: Object.assign({}, state.info.game, {
            previousMaps,
            map: setMap,
            nextMaps
          })
        })
      });
    },
    [REVEAL]: state => {
      if (
        action.seed !== state.info.game.map.seed
      ) return state;
      const { fields, info: { game: { isPractice } } } = state;
      const newInfo = action.positions.reduce((info, pos) => {
        const cell = cellAt(fields, pos.x, pos.y);
        let { game: { map: { revealCount } } } = info;
        if (!cell.mine) {
          revealCount += 1;
        } else if (!isPractice) {
          return Object.assign({}, info, {
            game: Object.assign({}, info.game, {
              map: Object.assign({}, info.game.map, {
                exploded: true
              })
            })
          });
        }
        return Object.assign({}, info, {
          bestHardcore: Math.max(info.bestHardcore, revealCount),
          game: Object.assign({}, info.game, {
            map: Object.assign({}, info.game.map, { revealCount })
          })
        });
      }, state.info);
      return Object.assign({}, state, { info: newInfo });
    },
    [SET_PLAYER_ID]: (state, { playerId }) => Object.assign({}, state, {
      info: Object.assign({}, state.info, { playerId })
    })
  }[action.type];
  return r ? r(state, action) : state;
}
