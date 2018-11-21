import { getCurrentUser } from '../services/user';

export default {
  namespace: 'user',

  state: {
    currentUser: {},
    permissions: [],
    loading: false,
  },

  effects: {
    * getCurrentUser(_, { call, put }) {
      const { data: payload } = yield call(getCurrentUser);
      yield put({
        type: 'setCurrentUser',
        payload,
      });
    },
  },

  reducers: {
    setCurrentUser(state, { payload }) {
      const { visualPermissions = [], productLines = [], ...currentUser } = payload;
      const permissions = visualPermissions.map(v => ~~v).sort((a, b) => a < b ? -1 : 1);
      return {
        ...state,
        currentUser,
        permissions,
        productLines,
      };
    },
  },
};
