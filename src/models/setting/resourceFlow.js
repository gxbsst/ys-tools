import { message } from 'antd';
import {
  queryResourceFlow,
  editResourceFlow,
} from '../../services/resourceFlow';

export default {
  namespace: 'resourceFlow',

  state: {
    newRetailFlow: {},
    newRetailFetched: false,

    arrivalFlow: {},
    arrivalFetched: false,

    loading: false,
    submitting: false,
  },

  effects: {
    * fetch({payload}, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: { loading: true },
      });
      try {
        const response = yield call(queryResourceFlow, payload);
        yield put({
          type: 'show',
          payload: {
            [['', 'newRetailFlow', 'arrivalFlow'][payload]]: response.data || {},
          },
        });
        return response;
      } catch (res) {
        return false;
      } finally {
        yield put({
          type: 'changeLoading',
          payload: { loading: false },
        });
      }
    },
    * edit({payload}, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      try {
        const res = yield call(editResourceFlow, payload);
        if (!res.code) {
          message.success(res.message);
        } else {
          message.error(res.message);
        }
        return res;
      } catch (res) {
        return res;
      } finally {
        yield put({
          type: 'changeSubmitting',
          payload: false,
        });
      }
    },
  },

  reducers: {
    show(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    changeLoading(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    changeSubmitting(state, { payload }) {
      return {
        ...state,
        submitting: payload,
      };
    },
  },
};
