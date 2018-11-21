const software = [{
  title: '产品名称',
  dataIndex: 'name',
}, {
  title: '软件系列',
  dataIndex: 'softwareSeriesName',
}, {
  title: '期限版本',
  dataIndex: 'saleVersionName',
  render: (val, record) =>
    record.chargeMode == 1 ? val : '——',
}, {
  title: '服务期限',
  dataIndex: 'serviceTime',
  render: (val, record) =>
    record.chargeMode == 1 ? (val && ((val >= 12 && val % 12 == 0) ? `${val / 12} 年` : `${val} 月`)) : '——',
}, {
  title: '赠送期限',
  dataIndex: 'presentTime',
  render: (val, record) =>
    record.chargeMode == 1 ? (val && ((val >= 12 && val % 12 == 0) ? `${val / 12} 年` : `${val} 月`)) : '——',
}, {
  title: '门店数量',
  dataIndex: 'storeNum',
}, {
  title: '产品价格',
  dataIndex: 'price',
}, {
  title: '服务价格',
  dataIndex: 'servicePrice',
}];

const hardware = [{
  title: '产品名称',
  dataIndex: 'name',
}, {
  title: '成本价格',
  dataIndex: 'costPrice',
}, {
  title: '产品价格',
  dataIndex: 'price',
}, {
  title: '服务价格',
  dataIndex: 'servicePrice',
}, {
  title: '计费单位',
  dataIndex: 'chargeUnit',
  render: val => ({1: '个', 2: '次'}[val]),
}];

const increment = [{
  title: '产品名称',
  dataIndex: 'name',
}, {
  title: '产品价格',
  dataIndex: 'price',
}, {
  title: '服务价格',
  dataIndex: 'servicePrice',
}, {
  title: '计费单位',
  dataIndex: 'chargeUnit',
  render: val => ({3: '年', 4: '月'}[val]),
}];

export default {
  software,
  hardware,
  increment,
}
