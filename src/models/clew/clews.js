import { message } from 'antd';
import { routerRedux } from 'dva/router';
import pathToRegexp from 'path-to-regexp';
import {
  queryClews,
  queryClewInfoById,
  queryContactsById,
  queryStoresById,
  queryClewLogs,
  addClew,
  cleanClew,
  assignClew,
  checkClew,
  applyClew,
  urgentClew,
  arraignClew,
  abandonClew,
  activateClew,
  rolloutClew,
  removeClews,
  batchCheckClew,
} from '../../services/clews';

export default {
  namespace: 'clews',
  state: {
    data: {
      data: [],
      pagination: {},
    },
    clew: {
      clewInfo: {},
      contacts: [],
      stores: [],
    },
    logs: {
      data: [],
      pagination: {},
    },
    cleanFieldsChanged: false,
    clewSubmitting: false,
    loading: false,
  },

  effects: {
    /**
     * get clew list
     * @param  {Object}    payload searcher
     */
    * fetch({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      yield put({
        type: 'save',
        payload: {
          data: [],
          pagination: {},
        },
      });
      try {
        const res = yield call(queryClews, payload);
        yield put({
          type: 'save',
          payload: res,
        });
        return res
      } catch (res) {
        return;
      } finally {
        yield put({
          type: 'changeLoading',
          payload: false,
        });
      }
    },

    /**
     * get clew detail by id
     * @param  {Number}    payload id
     */
    * detail({ payload }, { call, put, all }) {
      try {
        const res = yield all([
          call(queryClewInfoById, payload),
          call(queryContactsById, payload),
          call(queryStoresById, payload),
        ]);
        const [clewInfo, contacts, stores] = res;
        if (res.every(i => !i.code)) {
          yield put({
            type: 'saveDetail',
            payload: {
              clewInfo: clewInfo.data,
              contacts: contacts.data,
              stores: stores.data,
            },
          });
        }
      } catch (e) {
        message.error(e.message);
      }
    },

    /**
     * get clew option logs by id
     * @param  {Number}    payload id
     */
    * logs({ payload }, { call, put }) {
      try {
        const res = yield call(queryClewLogs, payload);
        if (!res.code) {
          yield put({
            type: 'saveLogs',
            payload: {
              data: res.data,
              pagination: res.pagination,
            },
          });
        }
      } catch (e) {
        message.error(e.message);
      }
    },

    /**
     * assign clew
     * @param  {Object}    payload  customer(id, name) & clew ids
     * @param  {Function}  callback callback options
     */
    * assign({ payload }, { call }) {
      try {
        const response = yield call(assignClew, payload);
        message.success(response.message);
        return response;
      } catch (response) {
        return response;
      }
    },

    /**
     * urgent clew
     * @param  {Object}    payload  clewId
     */
    * urgent({ payload }, { call }) {
      return yield call(urgentClew, payload);
    },

    /**
     * check clew
     * @param  {Object}    payload  customer & clew id
     * @param  {Function}  callback callback options
     */
    * check({ payload }, { call }) {
      const res = yield call(checkClew, payload);
      message.success(res.message);
      return res;
    },

    /**
     * batchCheck clew
     * @param  {Object}    payload  customer & clew id
     * @param  {Function}  callback callback options
     */
    * batchCheck({ payload }, { call }) {
      try {
        const res = yield call(batchCheckClew, payload);
        message.success(res.message);
        return res;
      } catch (res) {
        return res;
      }
    },

    /**
     * apply clew
     * @param  {Object}    payload  customer & clew id
     * @param  {Function}  callback callback options
     */
    * apply({ payload }, { call }) {
      try {
        const response = yield call(applyClew, payload);
        return response;
      } catch (response) {
        return response;
      }
    },

    /**
     * abandon clew
     * @param  {Object}    payload  customer & clew id
     * @param  {Function}  callback callback options
     */
    * abandon({ payload }, { call }) {
      try {
        const res = yield call(abandonClew, payload);
        return res;
      } catch (res) {
        return res;
      }
    },

    /**
     * arraign clew
     * @param  {Object}    payload  customer & clew id
     * @param  {Function}  callback callback options
     */
    * arraign({ payload }, { call, put }) {
      const res = yield call(arraignClew, payload);
      if (!res.code) {
        message.success(res.message);
        yield put(routerRedux.push('/clew/clews'));
      } else {
        message.error(res.message);
      }
      return res;
    },

    /**
     * activate clew
     * @param  {Object}    payload  customer & clew id
     */
    * activate({ payload }, { call, put }) {
      const res = yield call(activateClew, payload);
      if (!res.code) {
        message.success(res.message);
        yield put(routerRedux.push('/clew/clews'));
      } else {
        message.error(res.message);
      }
      return res;
    },

    /**
     * rollout clew
     * @param  {Object}    payload   clewId
     */
    * rollout({ payload }, { call, put }) {
      const res = yield call(rolloutClew, payload);
      if (!res.code) {
        message.success(res.message);
        yield put(routerRedux.push('/clew/clews'));
      } else {
        message.error(res.message);
      }
      return res;
    },

    /**
     * add new clew
     * @param  {Object}    payload  clew info
     */
    * add({ payload }, { call }) {
      try {
        return yield call(addClew, payload);
      } catch (res) {
        return res;
      }
    },

    /**
     * clew clean
     * @param  {Object}    payload  cleaned clew info
     * @param  {Function}  callback callback options
     */
    * clean({ payload }, { call, put }) {
      yield put({
        type: 'changeClewSubmitting',
        payload: true,
      });
      try {
        return yield call(cleanClew, payload);
      } catch (res) {
        return res;
      } finally {
        yield put({
          type: 'changeClewSubmitting',
          payload: false,
        });
      }
    },
    * remove({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(removeClews, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    * onCleanFieldsChange({ payload }, { put }) {
      yield put({
        type: 'changeCleanFields',
        payload,
      });
    },
    * resetDetail(_, { put }) {
      yield put({
        type: 'saveDetail',
        payload: {
          clewInfo: {},
          contacts: [],
          stores: [],
        },
      });
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveDetail(state, action) {
      return {
        ...state,
        clew: action.payload,
      };
    },
    saveLogs(state, action) {
      return {
        ...state,
        logs: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    changeClewSubmitting(state, action) {
      return {
        ...state,
        clewSubmitting: action.payload,
      };
    },
    changeCleanFields(state, action) {
      return {
        ...state,
        cleanFieldsChanged: action.payload,
      };
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {
        const match = pathToRegexp('/clew/clews/:id/:option').exec(pathname);
        if (match) {
          dispatch({
            type: 'resetDetail',
          });
          const id = match[1];
          dispatch({
            type: 'detail',
            payload: id,
          });
        }
      });
    },
  },
};
