import { message } from 'antd';
import {
  deleteRepay,
  addRepay,
  editRepay,
  saveEdit,
  linkBusiness,
  saveLinkBusi,
  repayCancelLink
} from '../services/finance';

export default {
  namespace: 'repay',

  state: {
    confirmLoading: false,
    isModalClose: false,
    lookRepayInfo: {},
    editRepayInfo: {},
    linkBusi: []
  },

  effects: {
    * deleteRepay({ payload }, { call, put }) {
      try {
        const res = yield call(deleteRepay, payload);
        if (!res.code) {
          message.success('删除成功！');
        }
        return res;
      } catch (res) {
        return res;
      }
    },
    * addRepay({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true
      });
      try {
        const res = yield call(addRepay, payload);
        if (!res.code) {
          message.success('新建成功！');
          yield put({
            type: 'changeModalStatus',
            payload: true
          });
        }
        return res;
      } catch (res) {
        return res;
      } finally {
        yield put({
          type: 'changeLoading',
          payload: false
        });
      }
    },
    * lookRepay({ payload }, { call, put }) {
      yield put({
        type: 'changeModalStatus',
        payload: false
      });
      const res = yield call(editRepay, payload);
      yield put({
        type: 'saveLookInfo',
        payload: res.data
      });
    },
    * editRepay({ payload }, { call, put }) {
      yield put({
        type: 'changeModalStatus',
        payload: false
      });
      const res = yield call(editRepay, payload);
      yield put({
        type: 'saveEditInfo',
        payload: res.data
      });
    },
    * saveEdit({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true
      });
      try {
        const res = yield call(saveEdit, payload);
        if (!res.code) {
          message.success('编辑成功！');
          yield put({
            type: 'changeModalStatus',
            payload: true
          });
        }
        return res;
      } catch (res) {
        return res;
      } finally {
        yield put({
          type: 'changeLoading',
          payload: false
        });
      }
    },
    * linkBusiness({ payload }, { call, put }) {
      yield put({
        type: 'changeModalStatus',
        payload: false
      });
      const res = yield call(linkBusiness, payload);
      yield put({
        type: 'saveLinkInfo',
        payload: res.data
      });
    },
    * saveLinkBusi({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true
      });
      try {
        const res = yield call(saveLinkBusi, payload);
        if (!res.code) {
          message.success('关联业务成功！');
          yield put({
            type: 'changeModalStatus',
            payload: true
          });
        }
        return res;
      } catch (res) {
        return res;
      } finally {
        yield put({
          type: 'changeLoading',
          payload: false
        });
      }
    },
    * cancelLink({ payload }, { call, put }) {
      try {
        const res = yield call(repayCancelLink, payload);
        if (!res.code) {
          message.success('取消关联成功！');
        }
        return res;
      } catch (res) {
        return res;
      }
    }
  },

  reducers: {
    changeLoading(state, { payload }) {
      return {
        ...state,
        confirmLoading: payload
      };
    },
    changeModalStatus(state, { payload }) {
      return {
        ...state,
        isModalClose: payload
      };
    },
    saveLookInfo(state, { payload }) {
      return {
        ...state,
        lookRepayInfo: payload
      };
    },
    saveEditInfo(state, { payload }) {
      return {
        ...state,
        editRepayInfo: payload
      };
    },
    saveLinkInfo(state, { payload }) {
      return {
        ...state,
        linkBusi: payload
      };
    }
  }
};
