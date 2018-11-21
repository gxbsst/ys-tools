import { message } from 'antd';
import { approve } from '../services/approval';

export default {
  namespace: 'approval',

  state: {},

  effects: {
    * approve({ payload }, { call }) {
      try {
        const res = yield call(approve, payload);
        if (!res.code) {
          message.success('审批成功！');
        }
        return res;
      } catch (res) {
        return res;
      }
    }
  },

  reducers: {}
};
