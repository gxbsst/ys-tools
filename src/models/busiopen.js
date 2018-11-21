import { message } from 'antd';
import { openService } from '../services/finance';

export default {
  namespace: 'busiopen',

  state: {
    busiOpenList: []
  },

  effects: {
    * openService({ payload }, { call, put }) {
      try {
        const res = yield call(openService, payload);
        if (!res.code) {
          message.success('开通成功！');
        }
        return res;
      } catch (res) {
        if (res.code !== -1) {
          message.error(res.message);
        }
        return res;
      }
    }
    // *deleteService({ payload }, { call, put }) {
    //   try {
    //     const res = yield call(deleteService, payload);
    //     if (!res.code) {
    //       message.success("作废成功！");
    //     }
    //     return res;
    //   } catch (res) {
    //     if (res.code !== -1) {
    //       message.error(res.message);
    //     }
    //     return res;
    //   }
    // }
  },

  reducers: {}
};
