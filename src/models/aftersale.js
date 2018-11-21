import {message} from 'antd'
import {
  followInfoList
} from '../services/aftersale'

const info = (text) => {
  error.info(text);
};
export default {
  namespace: 'aftersale',
  state: {
    followList: '',
    username: '',
    chance:'',
  },
  effects: {
    * followInfoList({params}, {call, put}) {
      const {data} = yield call(followInfoList, params);
      console.info('de', data)
      if (data) {
        yield put({
          type: 'getfollowInfoList',
          payload: data,
        })
      } else {
        this.info('😯，出错了')
      }
    }
  },
  reducers: {
    getfollowInfoList(state, action) {
      return {
        ...state,
        followList: action.payload
      }
    },
    // // 保存客户名称
    // saveCustomerName(state, action) {
    //   return {
    //     ...state,
    //     username: action.payload
    //   }
    // },
    // // 保存机会id
    // saveCustomerChance(state, action) {
    //   return {
    //     ...state,
    //     chance: action.payload
    //   }
    // }
  }
}
