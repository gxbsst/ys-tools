
import {publicClientSearch,publicClewsSearch,publicChancesSearch,clewsUrgent,changesUrgent} from "../services/business";

export default {
  namespace: 'search',
  state: {
    clients:{},
    clews:{},
    chances:{},
    chanceUrgent:{}
  },
  effects: {
    * getClient({payload}, {call, put}) {
      const response = yield call(publicClientSearch, payload);
      yield put({
        type: 'setClient',
        payload: response,
      });
    },
    * getClews({payload}, {call, put}) {
      const response = yield call(publicClewsSearch, payload);
      yield put({
        type: 'setClews',
        payload: response,
      });
    },
    * getChances({payload}, {call, put}) {
      const response = yield call(publicChancesSearch, payload);
      console.log(response,111111);
      yield put({
        type: 'setChances',
        payload: response,
      });
    },
    * getClewsUrgent({payload}, {call, put}) {
      console.log(11);
      const response = yield call(clewsUrgent, payload);
      console.log(response,11111);
    },
    * getChangesUrgent({payload}, {call, put}) {
      console.log(22);
      const response =yield call(changesUrgent, payload);
      console.log(response);
      yield put({
        type: 'getChangesUrgent',
        payload: response,
      });
    },
  },
  reducers: {
    setClient(state, action) {
      return {
        ...state,
        clients: action.payload,
      };
    },
    setClews(state, action) {
      return {
        ...state,
        clews: action.payload,
      };
    },
    setChances(state, action) {
      return {
        ...state,
        chances: action.payload,
      };
    },
    getChangesUrgent(state, action) {
      return {
        ...state,
        chanceUrgent: action.payload,
      };
    },
  }
}
