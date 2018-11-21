import { message } from 'antd';
import {
  deleteInvoice,
  giveInvoice,
  invoiceLinkBusi,
  invoiceSaveLinkBusi,
  queryDetail,
  invoiceCancelLink
} from '../services/finance';

export default {
  namespace: 'invoice',

  state: {
    invoiceList: [],
    confirmLoading: false,
    isModalClose: false,
    linkBusi: [],
    detailData: {}
  },

  effects: {
    * deleteInvoice({ payload }, { call, put }) {
      try {
        const res = yield call(deleteInvoice, payload);
        if (!res.code) {
          message.success('作废成功！');
        }
        return res;
      } catch (res) {
        return res;
      }
    },
    * giveInvoice({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true
      });
      try {
        const res = yield call(giveInvoice, payload);
        if (!res.code) {
          message.success('开发票成功！');
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
      const res = yield call(invoiceLinkBusi, payload);
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
        const res = yield call(invoiceSaveLinkBusi, payload);
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
    * fetchDetail({ payload }, { call, put }) {
      yield put({
        type: 'changeModalStatus',
        payload: false
      });
      const res = yield call(queryDetail, payload);
      yield put({
        type: 'saveDetail',
        payload: res.data
      });
    },
    * cancelLink({ payload }, { call, put }) {
      const res = yield call(invoiceCancelLink, payload);
      if (!res.code) {
        message.success('取消关联成功！');
      } else {
        message.error('取消关联失败！');
      }
      return res;
    },
    * changeModal({ payload }, { put }) {
      yield put({
        type: 'changeModalStatus',
        payload
      });
    }
  },

  reducers: {
    saveInvoiceList(state, { payload }) {
      return {
        ...state,
        invoiceList: payload
      };
    },
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
    saveLinkInfo(state, { payload }) {
      return {
        ...state,
        linkBusi: payload
      };
    },
    saveDetail(state, { payload }) {
      return {
        ...state,
        detailData: payload
      };
    }
  }
};
