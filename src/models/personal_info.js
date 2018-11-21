import _ from 'lodash';
import {message} from 'antd'
import {
  GetStaff,
  addPersonal,
  getBranch,
  getBranchStaff,
  addTissue,
  delTissue,
  getStaffList,
  addStaff,
  newStaff,
  delRole,
  getRoleTree,
  addRole,
  editRole
} from '../services/personal_info';

export default {
  namespace: 'personal_info',
  state: {
    list: [],
    branch: '',
    branchStaffList: [],
    status: '',
    staffAllList: [],
    roleTree: '',
    cityList: [],
    loading: false,
  },
  effects: {
    // dispatch 异步请求
    * getStaffList(_, {call, put}) {
      const {data} = yield call(getStaffList);
      yield put({
        type: 'staffAllList',
        payload: data,
      });
    },
    * edit({params, id}, {call, put}) {
      const response = yield call(addPersonal, params, id);
      yield put({
        // type action的type
        type: 'editInfo',
        payload: response
      });
    },
    * branch(_, {call, put}) {
      yield put({
        type: 'changeLoading',
        payload: {loading: true},
      });
      const {data} = yield call(getBranch);
      yield put({
        // type action的type
        type: 'branchData',
        payload: data
      });
      yield put({
        type: 'changeLoading',
        payload: {loading: false},
      });
    },
    * getbranchstaff({payload: {id = 1}}, {call, put}) {
      yield put({
        type: 'changeLoading',
        payload: {loading: true},
      });
      const {data} = yield call(getBranchStaff, {id});
      yield put({
        type: 'branchStaff',
        payload: data,
      });
      yield put({
        type: 'changeLoading',
        payload: {loading: false},
      });
    },
// 新建组织
    * addTissue({params}, {call, put}) {
      try {
        yield call(addTissue, params);
        message.success('目录新建成功');
      } catch (response) {
        message.error(response.message);
      }
    },
// 删除组织
    * delTissue({id}, {call, put}) {
      try {
        const {data} = yield call(delTissue, id);
        message.success('目录删除成功');
      } catch (err) {
        message.error(err.message);
      }
    },

// 添加员工
    * addStaff({dId, eId, params}, {call, put}) {
      try {
        const {code, message: msg} = yield call(addStaff, {dId, eId, params});
        message.success(msg);
      } catch (err) {
        message.error(msg);
      }
    },
    // 新建员工
    * newStaff({params}, {call, put}) {
      const {data} = yield call(newStaff, params);
      data && message.success('新建成功');
    },
    // 删除角色
    * delRole({params}, {call, put}) {
      const response = yield call(delRole, params);
    },
    * getRoleTree(_, {call, put}) {
      const response = yield call(getRoleTree);
      yield put({
        // type action的type
        type: 'getRoleTreeList',
        payload: response.data,
      });

    },
    // 添加角色
    * addRole({params}, {call, put}) {
      const response = yield call(addRole, params);
      console.info('添加角色', response);
      if (!response.code) {
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    },
    // 编辑角色
    * editRole({params}, {call, put}) {
      const response = yield call(editRole, params)
      if (!response.code) {
        message.success(response.message);
      } else {
        message.error(response.message);
      }

    },
    * skipTo({payload}) {
      yield put(routerRedux.push('/personnel/roleManage'));
    }
  },
  reducers: {
    // loading
    changeLoading(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    staffAllList(state, action) {
      return {
        ...state,
        staffAllList: action.payload,
      }
    },
    staffList(state, action) {
      return {
        ...state,
        list: action.payload,
      }
    },
    editInfo(state, action) {
      return {
        ...state,
        editStatus: action.payload
      }
    },
    branchData(state, action) {
      return {
        ...state,
        branch: action.payload
      }
    },
    branchStaff(state, action) {
      return {
        ...state,
        branchStaffList: action.payload
      }
    },
    getRoleTreeList(state, action) {
      return {
        ...state,
        roleTree: action.payload
      }
    },

  },
}
