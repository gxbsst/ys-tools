import { message } from 'antd';
import {
  queryProductDir,
  queryProductSeries,
  addProductDir,
  addProduct,
  updateProduct,
  migrateProductDir,
  getProductInfoById,
  deleteProductDir,
  queryProductList,
} from '../../services/products';

export default {
  namespace: 'products',

  state: {
    product: {},
    productDir: [],
    productSeries: [],
    softwareList: [],
    hardwareList: [],
    incrementList: [],
    loadingProductDir: false,
    loadingProductList: false,
    confirmLoading: false,
  },

  effects: {
    * getProductDir({ payload }, { call, put }) {
      yield put({
        type: 'changeLoadingProductDir',
        payload: true,
      });
      try {
        const response = yield call(queryProductDir, payload);
        if (!response.code) {
          yield put({
            type: 'saveProductDir',
            payload: response.data || [],
          });
        } else {
          message.error(response.message);
        }
      } catch (res) {
        return;
      } finally {
        yield put({
          type: 'changeLoadingProductDir',
          payload: false,
        });
      }
    },
    * fetchProductList({ payload }, { call, put }) {
      yield put({
        type: 'changeLoadingProductList',
        payload: true,
      });
      try {
        const response = yield call(queryProductList, payload);
        return response;
      } catch (err) {
        return err;
      } finally {
        yield put({
          type: 'changeLoadingProductList',
          payload: false,
        });
      }
    },
    * getProductSeries({ payload }, { call, put }) {
      const response = yield call(queryProductSeries, payload);
      yield put({
        type: 'saveProductSeries',
        payload: response.data,
      });
    },
    * getProductInfo({ payload }, { call, put }) {
      try {
        const response = yield call(getProductInfoById, payload);
        yield put({
          type: 'saveProduct',
          payload: response.data,
        });
        return response;
      } catch (err) {
        return err;
      }
    },
    * addDir({ payload }, { call, put }) {
      yield put({
        type: 'changeConfirmLoading',
        payload: true,
      });
      try {
        yield call(addProductDir, payload);
        message.success('添加成功');
        return true;
      } catch (response) {
        message.error(response.message);
      } finally {
        yield put({
          type: 'changeConfirmLoading',
          payload: false,
        });
      }
    },
    * createProduct({ payload }, { call, put }) {
      try {
        yield put({
          type: 'changeConfirmLoading',
          payload: true,
        });
        const res = yield call(addProduct, payload);
        message.success('添加成功');
        yield put({
          type: 'changeConfirmLoading',
          payload: false,
        });
        return res;
      } catch (response) {
        yield put({
          type: 'changeConfirmLoading',
          payload: false,
        });
      }
    },
    * updateProduct({ payload }, { call, put }) {
      try {
        yield put({
          type: 'changeConfirmLoading',
          payload: true,
        });
        const res = yield call(updateProduct, payload);
        message.success('修改成功');
        yield put({
          type: 'changeConfirmLoading',
          payload: false,
        });
        return res;
      } catch (response) {
        yield put({
          type: 'changeConfirmLoading',
          payload: false,
        });
      }
    },
    * migrateDir({ payload }, { call, put }) {
      try {
        yield put({
          type: 'changeConfirmLoading',
          payload: true,
        });
        yield call(migrateProductDir, payload);
        message.success('目录转移成功');
        yield put({
          type: 'changeConfirmLoading',
          payload: false,
        });
        return true;
      } catch (response) {
        yield put({
          type: 'changeConfirmLoading',
          payload: false,
        });
      }
    },
    * deleteDir({ payload }, { call }) {
      return yield call(deleteProductDir, payload);
    },
  },

  reducers: {
    saveProduct(state, { payload }) {
      return {
        ...state,
        product: payload,
      }
    },
    saveProductDir(state, { payload }) {
      return {
        ...state,
        productDir: payload,
      };
    },
    saveProductSeries(state, { payload }) {
      return {
        ...state,
        productSeries: payload,
      };
    },
    changeConfirmLoading(state, { payload }) {
      return {
        ...state,
        confirmLoading: payload,
      };
    },
    changeLoadingProductDir(state, { payload }) {
      return {
        ...state,
        loadingProductDir: payload,
      };
    },
    changeLoadingProductList(state, { payload }) {
      return {
        ...state,
        loadingProductList: payload,
      };
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {
        if (pathname === '/setting/products') {
          dispatch({
            type: 'getProductDir',
          });
        }
      });
    },
  },
};
