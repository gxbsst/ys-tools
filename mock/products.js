const editResourceFlow = {
  code: 0,
  message: '编辑成功',
}
const getProductDir = {
  code: 0,
  data: [
    { id: 1, parentId: 0, name: '产品管理' },
    { id: 2, parentId: 1, name: '新零售产品线' },
    { id: 3, parentId: 1, name: '到店产品线' },
    { id: 4, parentId: 2, name: '微电商解决方案' },
    { id: 5, parentId: 2, name: '微站解决方案' },
    { id: 6, parentId: 2, name: '会务解决方案' },
    { id: 7, parentId: 2, name: '微盟老业务' },
    { id: 8, parentId: 3, name: '智慧外卖解决方案' },
    { id: 9, parentId: 3, name: '智慧餐厅解决方案' },
    { id: 10, parentId: 3, name: '客来店解决方案' },
    { id: 11, parentId: 7, name: '微汽车方案' },
    { id: 12, parentId: 7, name: '微酒店方案' },
    { id: 13, parentId: 7, name: '微医疗方案' },
  ],
  message: '获取成功',
}

const getProductList = {
  code: 0,
  data: [
    {
      chargeMode: 0,
      chargeUnit: 0,
      cost_price: 800,
      id: 1,
      name: 'daffd',
      persentTime: 24,
      storeNum: 4,
      price: 2500,
      saleVersion: '至尊版',
      servicePrice: 1000,
      serviceTime: 24,
      productDir: ['9', '13'],
      softwareSeries: ['zhejiang', 'hangzhou', 'xihu'],
    },
    {
      chargeMode: 0,
      chargeUnit: 0,
      cost_price: 800,
      id: 2,
      storeNum: 3,
      name: 'daffd',
      persentTime: 24,
      price: 2500,
      saleVersion: '至尊版',
      servicePrice: 1000,
      serviceTime: 24,
      productDir: ['9', '13'],
      softwareSeries: ['zhejiang', 'hangzhou', 'xihu'],
    }
  ],
  message: '操作成功'
};

const getArrivalFlow = {
  code: 0,
  data: {
    privateTime: 1,
    privateNum: 2,

    osPrivateValidTime: 3,
    osPrivateNum: 2,
    ISToOSTime: 1,
    type: 2,
  },
  message: '操作成功',
}

export default {
  getProductList,
  getProductDir,
  getArrivalFlow,
  editResourceFlow,
};
