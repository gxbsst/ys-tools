import { getSeatList } from '../services/seat';

export default {
  namespace: 'seat',

  state: {
    data: [],
    pagination: {},
    loading: false
  },

  effects: {
    *fetch(_, {call, put}) {
      yield put({
        type: 'setState',
        payload: {
          loading: true
        }
      });
      const {data, pagination} = yield call(getSeatList);
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
