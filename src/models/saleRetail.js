import { message } from 'antd';
import { routerRedux } from 'dva/router';
import {
  queryHighSeaList,
  applyChance,
  rejectChance,
  addFollowRecord,
  queryChanceDetail,
  queryRecordsList,
  removePushOrder,
  abandonChance,
  pushOrderConfirmBasic,
  queryMyRelativeBusiness,
  querySelectOptions,
  editChanceDetail,
  pushOrderIntentionConfirm,
  queryContactsInfo,
  queryStoresInfo,
  queryIntentionInfo,
  queryPrivateSeaList,
  applyDelay,
  addContactRecord,
  addVisitRecord,
  queryPushOrderDetail,
  pushPushOrder,
  queryWaitAudit,
  approval,
  batchAllocation,
  queryCustomersList,
  addBusiness,
  queryOSWaitAudit,
  queryPrivateSeaConfig,
} from '../services/saleRetail';

export default {
  namespace: 'saleRetail', // 新零售常规组IS

  state: {
    id: '', // 当前选中的机会详情id
    pushOrderID: '', // 当前选中的提单详情id
    currentDetail: null, // 当前选中的机会详情,基本信息
    currentPushOrder: null, // 当前选中的提单信息,
    relatedBusiness: null, // 提单时我可以关联的业务
    pushOrderModalInfo: null, // 提单弹窗信息
    highSeaData: { // 公海
      data: [],
      pagination: {},
    },
    privateSeaData: { // 私海
      data: [],
      pagination: {},
    },
    contactRecords: { // 联系记录
      data: [],
      pagination: {},
    },
    chanceRecords: { // 机会日志
      data: [],
      pagination: {},
    },
    linkRecords: { // 线索日志
      data: [],
      pagination: {},
    },
    followRecords: { // 跟进记录
      data: [],
      pagination: {},
    },
    visitRecords: { // 拜访记录
      data: [],
      pagination: {},
    },
    pushOrderRecords: { // 提单记录
      data: [],
      pagination: {},
    },
    waitAuditData: { // 私海待审核
      data: [],
      pagination: {},
    },
    customersData: { //客户列表
      data: [],
      pagination: {},
    },
    OSWaitAuditData: { // OS私海待审核
      data: [],
      pagination: {},
    },
    privateSeaConfig: { // 私海相关配置
      data: '',
    },
  },

  effects: {
    * querySelectOptions({ payload }, { call }) {
      const { type } = payload;
      let parmas = {}; // 有时需要根据type获取不同的额外数据
      const res = yield call(querySelectOptions, { ...payload, ...parmas });
      if (res.code === 0) {
        return res.data || [];
      } else {
        message.error(res.message);
      }
    },
    * queryHighSeaList({ payload }, { call, put }) { // 获取公海机会列表
      const highSeaData = yield call(queryHighSeaList, { ...payload });
      if (highSeaData.code === 0) {
        const { data, pagination } = highSeaData;
        yield put({
          type: 'updateState',
          payload: {
            highSeaData: {
              data, pagination,
            },
          },
        });
      }
    },
    * queryPushOrderModalInfo({ payload }, { call, put }) { // 获取机会详情页面的提单弹窗数据
      const { id } = payload;
      const res = yield call(queryIntentionInfo, { ...payload });
      if (res.code === 0) {
        yield put({
          type: 'updateState',
          payload: {
            pushOrderModalInfo: {
              ...res.data,
            },
            id,
          },
        });
        return true;
      } else {
        message.error(res.message);
        return false;
      }
    },
    * pushOrderIntentionConfirm({ payload }, { call }) { // 机会详情页面的提单弹窗提交
      const res = yield call(pushOrderIntentionConfirm, { ...payload });
      if (res.code === 0) {
        message.success('提交成功!');
        return true;
      } else {
        message.error(res.message);
        return false;
      }
    },
    * applyChance({ payload }, { call }) { // 申领机会
      const res = yield call(applyChance, { ...payload });
      if (res.code === 0) {
        message.success('申领成功!');
        return true;
      } else {
        message.error(res.message);
        return false;
      }
    },
    * batchAllocation({ payload }, { call }) { // 分配机会
      const res = yield call(batchAllocation, { ...payload });
      if (res.code === 0) {
        message.success(res.message);
        return true;
      } else {
        return false;
      }
    },
    * rejectChance({ payload }, { call }) { // 驳回机会
      const res = yield call(rejectChance, { ...payload });
      if (res.code === 0) {
        message.success('驳回成功!');
        return true;
      } else {
        message.error(res.message);
        return false;
      }
    },
    * applyDelay({ payload }, { call }) { // 申请延期
      const res = yield call(applyDelay, { ...payload });
      if (res.code === 0) { // 成功
        message.success('延期成功');
        return true
      }
      return false;
    },
    * addFollowRecord({ payload }, { call }) { // 新加跟进记录
      const res = yield call(addFollowRecord, { ...payload });
      if (res.code === 0) {
        if (payload.id) {
          message.success('编辑跟进记录成功!');
        } else {
          message.success('新加跟进记录成功!');
        }
        return true;
      } else {
        message.error(res.message);
        return false;
      }
    },
    * addVisitRecord({ payload }, { call }) { // 新加拜访记录
      const res = yield call(addVisitRecord, { ...payload });
      if (res.code === 0) {
        message.success('新加拜访记录成功!');
        return true;
      } else {
        message.error(res.message);
        return false;
      }
    },

    * addContactRecord({ payload }, { call }) { // 新加联系记录
      const res = yield call(addContactRecord, { ...payload });
      if (res.code === 0) {
        message.success('新加联系记录成功!');
        return true;
      } else {
        message.error(res.message);
        return false;
      }
    },
    * queryChanceDetail({ payload }, { call, put, all }) { // 请求机会详情基本信息
      const { id } = payload;
      const res = yield all([
        call(queryChanceDetail, { id }),
        call(queryContactsInfo, { id }),
        call(queryStoresInfo, { id }),
        call(queryIntentionInfo, { id }),
      ]);
      if (res.every(_ => _.code === 0)) {
        yield put({
          type: 'updateState',
          payload: {
            currentDetail: {
              ...(res[0].data || {}),
              contacts: [...(res[1].data || [])],
              stores: [...(res[2].data || [])],
              intentionInfo: { ...(res[3].data || {}) },
            },
            id,
          },
        });
      } else {
        message.error(res.message);
        yield put({
          type: 'updateState',
          payload: {
            currentDetail: null,
            id,
          },
        });
      }
    },
    * editChanceDetail({ payload }, { call, put, select }) { //编辑信息
      const detail =  yield select(state => state.saleRetail.currentDetail);
      const { intentionInfo, stores, contacts, ...chance} = detail;
      const params = {
        chance: {
          ...chance,
          ...payload.chance,
        },
        linkList: [...(payload.linkList || [])],
        storeList: [...(payload.storeList || [])],
        intention: {
          ...intentionInfo,
          ...(payload.intention || {}),
        }
      };
      // console.info(params)
      const res = yield call(editChanceDetail, { ...params });
      if (res.code === 0) { // 成功
        message.success('编辑成功');
        yield put(routerRedux.push(`/saleRetail/chanceDetail/${detail.id}/basic`));
        return true
      }
      return false;
    },
    * queryMyRelatedBusiness({ payload }, { call, put }) { // 请求提单页面我所关联的业务数据
      const res = yield call(queryMyRelativeBusiness);
      if (res.code === 0) {
        const { data } = res;
        yield put({
          type: 'updateState',
          payload: {
            relatedBusiness: [...data],
          },
        });
      } else {
        message.error(res.message);
        yield put({
          type: 'updateState',
          payload: {
            relatedBusiness: null,
          },
        });
      }
    },
    * queryPushOrderDetail({ payload }, { call, put }) { // 请求提单详情
      const { pushOrderID } = payload; // 这里要传的是提单id
      yield put({
        type: 'updateState',
        payload: {
          currentPushOrder: null,
          pushOrderID,
        },
      });
      const res =  yield call(queryPushOrderDetail, { id: pushOrderID});
      const { code, data } = res;
      if (code === 0 && data) {
        const { contractInfo, attachmentDtoList, payModeDtoList, saleName, chanceCustomerName, orderItemList, isContract, ...others } = JSON.parse(data);
        yield put({
          type: 'updateState',
          payload: {
            currentPushOrder: {
              ...others,
              basic: {
                ...contractInfo,
                isContract,
                createUser: saleName,
                customerName: chanceCustomerName,
              },
              orderItems: [ ...orderItemList],
              payModes: [ ...payModeDtoList],
              attachments: [ ...attachmentDtoList],
            },
          },
        })
      }
    },
    * queryRecords({ payload }, { call, put, select }) { // 请求日志, 根据tab判断
      const { tab } = payload;
      const [id] = yield select(state => [state.saleRetail.id]);
      const res = yield call(queryRecordsList, { ...payload, id });
      if (res.code === 0) {
        const { data = [], pagination = { totalCount: 0, page: 0, pageSize: 0 } } = res;
        yield put({
          type: 'updateState',
          payload: {
            [tab]: {
              data, pagination,
            },
          },
        });
      } else {
        message.error(res.message);
      }
    },
    * checkCurrentChance({ payload }, { put }) { // 跳转机会详情
      const { id } = payload;
      yield put({
        type: 'updateState',
        payload: { ...payload },
      });
      yield put(routerRedux.push(`/saleRetail/chanceDetail/${id}/basic`));
    },
    * checkCurrentPushOrder({ payload }, { put }) { // 跳转提单详情
      const { id } = payload;
      yield put({
        type: 'updateState',
        payload: { pushOrderID: id },
      });
      yield put(routerRedux.push(`/saleRetail/pushOrderDetail/${id}`));
    },
    * editCurrentPushOrder({ payload }, { put }) { // 跳转编辑提单详情
      const { id } = payload;
      yield put({
        type: 'updateState',
        payload: { pushOrderID: id },
      });
      yield put(routerRedux.push(`/saleRetail/pushOrderEdit/${id}`));
    },
    * pushOrder({ payload }, { put }) { // 跳转提单页面
      const { id } = payload;
      yield put(routerRedux.push(`/saleRetail/pushOrder/${id}`));
    },
    * queryPushOrderInfo({ payload }, { put, all, call }) { // 获取我的提单信息
      const { id } = payload;
      const [business] = yield all(
        [
          call(queryMyRelativeBusiness, { id }),
        ]
      );
      const { code, data = {} } = business;
      if (code === 0) {
        const {orderList = [], ...others} = data;
        yield put({
          type: 'updateState',
          payload: {
            currentPushOrder: {
              basic: {
                ...others,
              },
              orderItems:[...orderList],
              payModes: [],
              attachments: [],
            },
            id,
          },
        });
      }
    },
    * confirmPushOrder({ payload }, { call, select, all }) { // 确认提单,保存编辑的提单
      const id = yield select(state => state.saleRetail.id);
      //格式化
      const { payedWay, business, compact, pushOrderID, ...basic } = payload;
      let basicParams = {};
      if (compact.has) { //有合同
        basicParams = {
          attachmentDtoList: compact.fileList.map(item => ({fileName: item.name, fileUrl: item.url, fileSize: `${Math.ceil(item.size/1024)}kb` })),
          contractInfo: {
            buyerSignature: compact.paySign,
            comment: compact.remark,
            contractBegin: compact.startTime,
            contractCode: compact.no,
            contractDate: compact.registerTime,
            contractEnd: compact.endTime,
            sellerSignature: compact.payedSign,
            contractType: compact.type,
          },
          orderIdList: business.ids || [],
          isContract: compact.has,
          payModeDtoList: payedWay,
          sourceId: id,
          sourceType: 1,
        };
      } else { //不提合同
        basicParams = {
          attachmentDtoList: [],
          contractInfo: {},
          orderIdList: business.ids || [],
          isContract: compact.has,
          payModeDtoList: [],
          sourceId: id,
          sourceType: 1,
        }
      }
      const res = yield  all([
        call(pushOrderConfirmBasic, { ...basicParams }),
      ]);
      if (res.every(_ => _.code === 0)) { // 成功
        message.success('提单成功');
        window.history.back();
      }
    },
    * removeCurrentPushOrder({ payload }, { call }) { // 删除提单详情
      const pushOrderID = payload.id;
      const res = yield call(removePushOrder, { id: pushOrderID });
      if (res.code === 0) { // 成功
        message.success('删除成功');
      }
    },
    * pushCurrentPushOrder({ payload }, { call }) { // 提审提单详情
      const pushOrderID = payload.id;
      const res = yield call(pushPushOrder, { id: pushOrderID });
      if (res.code === 0) { // 成功
        message.success('提审成功');
      }
    },
    * abandonChance({ payload }, { call }) { // 放弃机会
      const abandonChanceID = payload.id;
      const res = yield call(abandonChance, { id: abandonChanceID });
      if (res.code === 0) { // 成功
        message.success('放弃成功');
        return true;
      }
      return false;
    },
    * queryPrivateSeaList({ payload }, { call, put }) { // 获私海列表
      const privateSeaData = yield call(queryPrivateSeaList, { ...payload });
      if (privateSeaData.code === 0) {
        const { data, pagination } = privateSeaData;
        yield put({
          type: 'updateState',
          payload: {
            privateSeaData: {
              data, pagination,
            },
          },
        });
      }
    },

    * queryWacitAudit({ payload }, { call, put }) { // 获私海待审核
      const waitAuditData = yield call(queryWaitAudit, { ...payload });
      if (waitAuditData.code === 0) {
        const { data, pagination } = waitAuditData;
        yield put({
          type: 'updateState',
          payload: {
            waitAuditData: {
              data, pagination,
            },
          },
        });
      }
    },

    * queryOSWacitAudit({ payload }, { call, put }) { // OS私海待审核
      const OSWaitAuditData = yield call(queryOSWaitAudit, { ...payload });
      if (OSWaitAuditData.code === 0) {
        const { data, pagination } = OSWaitAuditData;
        yield put({
          type: 'updateState',
          payload: {
            OSWaitAuditData: {
              data, pagination,
            },
          },
        });
      }
    },

    * approval({ payload }, { call }) { // 审批操作
      const res = yield call(approval, { ...payload });
      if (res.code === 0) {
        message.success(res.data.remark);
        return true;
      } else {
        message.error(res.message);
        return false;
      }
    },

    * queryCustomersList({ payload }, { call, put }) { // 获取公海机会列表
      const customersData = yield call(queryCustomersList, { ...payload });
      if (customersData.code === 0) {
        const { data, pagination } = customersData;
        yield put({
          type: 'updateState',
          payload: {
            customersData: {
              data, pagination,
            },
          },
        });
      }
    },
    * addBusiness({ payload }, { call }) { // 新开业务
      const res = yield call(addBusiness, { ...payload });
      if (res.code === 0) {
        message.success('提交成功!');
        return true;
      } else {
        message.error(res.message);
        return false;
      }
    },
    * queryPrivateSeaConfig({ payload }, { call, put }) { // 获取私海配置
      const privateSeaConfig = yield call(queryPrivateSeaConfig, { ...payload });
      if (privateSeaConfig.code === 0) {
        const { data } = privateSeaConfig;
        yield put({
          type: 'updateState',
          payload: {
            privateSeaConfig: {
              data
            },
          },
        });
      }
    },
  },

  reducers: {
    updateState(state, { payload }) { // 跟新一级状态
      return {
        ...state,
        ...payload,
      };
    },
  },
};
