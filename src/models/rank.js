import { getRankList } from '../services/rank';

export default {
  namespace: 'rank',

  state: {
    data: [],
    pagination: {},
    loading: false
  },

  effects: {
    * fetch(_, {call, put}) {
      yield put({
        type: 'setState',
        payload: {
          loading: true
        }
      });
      const {data, pagination} = yield call(getRankList);
      yield put({
        type: 'setState',
        payload: {
          data,
          pagination,
          loading: false
        }
      });
    },
  },

  reducers: {
    setState(state, {payload}) {
      return {
        ...state,
        ...payload
      }
    },
  },
};
