import { enums, storage } from '../utils';

export default {
  namespace: 'callCenter',

  state: {
    hover: false,
    active: false,
    fixed: storage('ccWidgetFixed') || false,
    isLogin: false,
    isPause: false,
    reservations: 0,
    enterpriseId: null,
    allCallBackCount: null,
    calling: null,
    hotLine: null,
    pwd: null,
    cno: null,
    bindTel: null,
    qname: '',
    staffs: [],
    callings: [],
    filters: enums('CALL_CENTER.STAFF_STATUS').map(item => item.value),
  },

  reducers: {
    setState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
  }
};
