import _ from 'lodash';
import {
  clientSearch,judgeOrderList,historyJudgeOrder,judgeFavoree,isJudge,
  contractsMag,contractsMagLink,contractBasicInfo,contractPayInfo,contractAccessory,contractsIsDelete,
  fundApplyList,fundApplyDetails,backMoneyList,relateBackMoney,cancleBackMoney
 } from "../services/business";

export default {
  namespace: 'business',
  state: {
    searchData: {},   // 存放客户查询后台数据
    judgeOrders:{},    //存放业务列表数据
    historyOrders:{},
    favorData:{},
    judgeData:{},
    contractItem:[], //合同数据开始
    basic:[],
    relate:{},
    pay:{},
    accessory:{},
    deleteData:{},//合同数据结束
    fundList:{},   //认款列表
    fundDetails:{},
    backMoneyList:{},
    relateBackMoney:{},
    cancleRelate:{},
  },
  effects: {
    * search({payload}, {call, put}) {
      const response = yield call(clientSearch, payload);
      yield put({
        type: 'saveSearch',
        payload: response,
      });
    },
    * judge({payload}, {call, put}) {
      const response = yield call(judgeOrderList, payload);
      yield put({
        type: 'saveJudge',
        payload: response,
      });
    },
    * historyJudge({payload}, {call, put}) {
      const response = yield call(historyJudgeOrder, payload);
      yield put({
        type: 'saveHistoryJudge',
        payload: response,
      });
    },
    * contract({payload}, {call, put}) {
      const response = yield call(contractsMag, payload);
      yield put({
        type: 'saveContracts',
        payload: response,
      });
    },
    * getItems({payload: {expanded, id}}, {call, put}) {
      if (expanded) {
        const {data} = yield call(contractsMagLink, id);
        yield put({
          type: 'setItems',
          payload: {items: data, id},
        });
      }
    },
    * getBasic({payload}, {call, put}) {
      const response = yield call(contractBasicInfo, payload);
      let arr = [];
      arr.push(response.data);
      yield put({
        type: 'setBasic',
        payload: arr,
      });
    },
    * getRelate({payload}, {call, put}) {
      const response = yield call(contractsMagLink, payload);
      yield put({
        type: 'setRelate',
        payload: response,
      });
    },
    * getPay({payload}, {call, put}) {
      const response = yield call(contractPayInfo, payload);
      yield put({
        type: 'setPay',
        payload: response,
      });
    },
    * getAccessory({payload}, {call, put}) {
      const response = yield call(contractAccessory, payload);

      yield put({
        type: 'setAccessory',
        payload: response,
      });
    },
    * isDelete({payload}, {call, put}) {
      const response = yield call(contractsIsDelete, payload);
      yield put({
        type: 'setIsDelete',
        payload: response,
      });
    },
    * getFavor({payload}, {call, put}) {
      console.log(payload)
      const response = yield call(judgeFavoree, payload);
      console.log(response);
      yield put({
        type: 'setFavor',
        payload: response,
      });
    },
    * getJudge({payload}, {call, put}) {
      const response = yield call(isJudge, payload);
      yield put({
        type: 'setJudge',
        payload: response,
      });
    },
    * getFund({payload}, {call, put}) {
      console.log(1);
      const response = yield call(fundApplyList, payload);
      console.log(response);
      yield put({
        type: 'setFund',
        payload: response,
      });
    },
    * getFundDetails({payload}, {call, put}) {
      const response = yield call(fundApplyDetails, payload);
      yield put({
        type: 'setFundDetails',
        payload: response,
      });
    },
    * getMoneyList({payload}, {call, put}) {
      const response = yield call(backMoneyList, payload);
      yield put({
        type: 'setMoneyList',
        payload: response,
      });
    },
    * getRelateMoney({payload}, {call, put}) {
      const response = yield call(relateBackMoney, payload);
      yield put({
        type: 'setRelateMoney',
        payload: response,
      });
    },
    * getRelateCancle({payload}, {call, put}) {
      const response = yield call(cancleBackMoney, payload);
      yield put({
        type: 'setRelateCancle',
        payload: response,
      });
    },
  },
  reducers: {
    saveSearch(state, action) {
      return {
        ...state,
        searchData: action.payload,
      };
    },
    saveJudge(state, action) {
      return {
        ...state,
        judgeOrders: action.payload,
      };
    },
    saveHistoryJudge(state, action) {
      return {
        ...state,
        historyOrders: action.payload,
      };
    },
    saveContracts(state, action) {
      return {
        ...state,
        contracts: action.payload
      };
    },
    // setItems(state, {payload: {items, id}}) {
    //   const contracts = _.cloneDeep(state.contracts);
    //   const contract = _.find(contracts.data, {id});
    //   contract.items = items;
    //   return {
    //     ...state,
    //     contracts
    //   };
    // },
    setItems(state, {payload: {items, id}}) {
      return {
        ...state,
        contractItem: items,
      };
    },
    setBasic(state, action) {
      return {
        ...state,
        basic: action.payload,
      };
    },
    setRelate(state, action) {
      return {
        ...state,
        relate: action.payload,
      };
    },
    setPay(state, action) {
      return {
        ...state,
        pay: action.payload,
      };
    },
    setAccessory(state, action) {
      return {
        ...state,
        accessory: action.payload,
      };
    },
    setIsDelete(state, action) {
      return {
        ...state,
        deleteData: action.payload,
      };
    },
    setFavor(state, action) {
      return {
        ...state,
        favorData: action.payload,
      };
    },
    setJudge(state, action) {
      return {
        ...state,
        judgeData: action.payload
      };
    },
    setFund(state, action) {
      return {
        ...state,
        fundList: action.payload
      };
    },
    setFundDetails(state, action) {
      return {
        ...state,
        fundDetails: action.payload
      };
    },
    setMoneyList(state, action) {
      return {
        ...state,
        backMoneyList: action.payload
      };
    },
    setRelateMoney(state, action) {
      return {
        ...state,
        relateBackMoney: action.payload
      };
    },
    setRelateCancle(state, action) {
      return {
        ...state,
        cancleRelate: action.payload
      };
    },
  }
}
