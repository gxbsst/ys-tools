import { getUrlParams } from './utils';

const clewTypeMap = ['到店', '新零售', '渠道加盟', '定制开发'];
const family = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王', '刘', '陈'];
const name = ['伟', '芳', '娜', '敏', '静', '秀英', '丽', '强', '磊', '洋'];
const clewSource = [7, 1, 3, 3];
const areaCodeMap = ['北京', '上海', '深圳', '杭州', '广州', '重庆', '成都', '苏州', '南京', '温州'];
const industryMap = ['人工智能', '教育', '金融', '汽车交通', '房产服务', '医疗健康', '旅游', '本地生活'];
// const clewSourceArr = [{'customer', '客服'}, {'sales': '销售录入'}, {'clews': '线索组导入'}, {'market': '市场部提供'}];
const clewSourceArr = ['客服', '销售录入', '线索组导入', '市场部提供'];
const clewSourceMap = [
  ['QQ', '电话', '商桥', '今日头条', '注册未绑定', '注册绑定', '手工创建'],
  ['销售录入'],
  ['线上采集', '线下采集', 'OS自拓'],
  ['老户转介绍', '总部提供', '伙伴计划']
];

const fromSource = (i) => `${clewSourceArr[i % 4]}_${clewSourceMap[i % 4][Math.floor(Math.random() * clewSource[i % 4])]}`.split('_');
// mock tableListDataSource
let tableListDataSource = [];
for (let i = 0; i < 46; i += 1) {
  tableListDataSource.push({
    key: i,
    disabled: ((i % 6) === 0),
    id: i + 1, //线索ID
    clewType: clewTypeMap[i % 4], //线索类型
    customerName: family[Math.floor(Math.random() * 10)] + name[Math.floor(Math.random() * 10)], //客户名称
    area: areaCodeMap[i % 10], //地区
    industry: industryMap[i % 8], //行业
    firstFromSource: fromSource(i)[0], //线索来源一级
    secondFromSource: fromSource(i)[1], //线索来源二级
    creatTime: new Date(`2017-07-${Math.floor(i / 2) + 1}`), //创建时间
    cleanTag: `cleanTag ${i % 9}`, //清洗标签
    status: Math.floor(Math.random() * 10) % 4, //状态
    handlerName: family[Math.floor(Math.random() * 10)] + name[Math.floor(Math.random() * 10)], //处理人
    updatedAt: new Date(`2017-07-${Math.floor(i / 2) + 1}`),
  });
}

export function getClews(req, res, u) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const params = getUrlParams(url);

  let dataSource = [...tableListDataSource];

  if (params.sorter) {
    const s = params.sorter.split('_');
    dataSource = dataSource.sort((prev, next) => {
      if (s[1] === 'descend') {
        return next[s[0]] - prev[s[0]];
      }
      return prev[s[0]] - next[s[0]];
    });
  }

  if (params.status) {
    const status = params.status.split(',');
    let filterDataSource = [];
    status.forEach((s) => {
      filterDataSource = filterDataSource.concat(
        [...dataSource].filter(data => parseInt(data.status, 10) === parseInt(s[0], 10))
      );
    });
    dataSource = filterDataSource;
  }

  if (params.no) {
    dataSource = dataSource.filter(data => data.no.indexOf(params.no) > -1);
  }

  let pageSize = 10;
  if (params.pageSize) {
    pageSize = params.pageSize * 1;
  }

  const result = {
    code: 0,
    data: dataSource,
    pagination: {
      total: dataSource.length,
      pageSize,
      current: parseInt(params.currentPage, 10) || 1,
    },
  };

  if (res && res.json) {
    res.json(result);
  } else {
    return result;
  }
}

export function postClews(req, res, u, b) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const body = (b && b.body) || req.body;
  const { method, no, description } = body;

  switch (method) {
    /* eslint no-case-declarations:0 */
    case 'delete':
      tableListDataSource = tableListDataSource.filter(item => no.indexOf(item.no) === -1);
      break;
    case 'post':
      const i = Math.ceil(Math.random() * 10000);
      tableListDataSource.unshift({
        key: i,
        href: 'https://ant.design',
        avatar: ['https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png', 'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png'][i % 2],
        no: `TradeCode ${i}`,
        title: `一个任务名称 ${i}`,
        owner: '曲丽丽',
        description,
        callNo: Math.floor(Math.random() * 1000),
        status: Math.floor(Math.random() * 10) % 2,
        updatedAt: new Date(),
        createdAt: new Date(),
        progress: Math.ceil(Math.random() * 100),
      });
      break;
    default:
      break;
  }
  const result = {
    list: tableListDataSource,
    pagination: {
      total: tableListDataSource.length,
    },
  };

  if (res && res.json) {
    res.json(result);
  } else {
    return result;
  }
}

export const clewOrigins = [
  {
    value: 'customer',
    label: '客服',
    children: [
      { value: 'qq', label: 'QQ'}, { value: 'phone', label: '电话'},
      { value: 'shangqiao', label: '商桥'}, { value: 'toutiao', label: '今日头条'},
      { value: 'zhucewb', label: '注册未绑定'}, { value: 'zhucebd', label: '注册绑定'},
      { value: 'handle', label: '手工创建'},
    ],
  }, {
    value: 'sales',
    label: '销售录入',
    children: [{ value: 'sales', label: '销售录入' }],
  }, {
    value: 'clews',
    label: '线索组导入',
    children: [
      { value: 'on', label: '线上采集' }, { value: 'off', label: '线下采集' },
      { value: 'os', label: 'OS自拓' }
    ],
  }, {
    value: 'market',
    label: '市场部提供',
    children: [
      { value: 'old', label: '老户转介绍' }, { value: 'center', label: '总部提供' },
      { value: 'friend', label: '伙伴计划' }
    ],
  }
]

export const productSeries = [
  {
    value: '1',
    label: '新云业务',
    children: [
      { value: '12', label: '客来店解决方案'},
      { value: '13', label: '智慧外卖'},
      { value: '11', label: '智慧餐厅'},
    ],
  }, {
    value: '2',
    label: '微盟老业务',
    children: [
      { value: '21', label: '微站服务版'},
      { value: '22', label: '会务商务版'},
    ],
  }
]

export const productSeries1 = [
  {
    createTime: '2018-02-08 14:23:48',
    name: '新云业务',
    updateTime: '201802-08 14:23:48',
    id: 1,
    parentId: 0,
  }, {
    createTime: '2018-02-08 14:24:15',
    name: '微盟老业务',
    updateTime: '2018-02-08 14:24:30',
    id: 2,
    parentId: 0,
  }, {
    createTime: '2018-02-08 14:24:35',
    name: '智慧餐厅',
    updateTime: '2018-02-08 14:24:52',
    id: 11,
    parentId: 1,
  }, {
    createTime: '2018-02-08 14:25:35',
    name: '客来店解决方案',
    updateTime: '2018-02-08 14:25:35',
    id: 12,
    parentId: 1,
  }, {
    createTime: '2018-02-08 14:25:37',
    name: '智慧外卖',
    updateTime: '2018-02-08 14:25:52',
    id: 13,
    parentId: 1,
  },
  {
    createTime: '2018-02-08 14:26:24',
    name: '微站商务版',
    updateTime: '2018-02-08 14:26:24',
    id: 21,
    parentId: 2,
  },
  {
    createTime: '2018-02-08 14:26:34',
    name: '会务商务版',
    updateTime: '2018-02-08 14:26:34',
    id: 22,
    parentId: 2,
  }
]

export const getClewLogs = {
  code: 0,
  data: [{
    clewId: 1,
    content: '操作内容',
    id: 1,
    method: 'clew',
    remark: '操作备注',
    result: '操作结果',
    userId: '1',
    userName: 'ning.ding'
  }, {
    clewId: 1,
    content: '操作内容',
    id: 2,
    method: 'clew',
    remark: '操作备注',
    result: '操作结果',
    userId: '1',
    userName: 'ning.ding'
  }, {
    clewId: 1,
    content: '操作内容',
    id: 3,
    method: 'clew',
    remark: '操作备注',
    result: '操作结果',
    userId: '1',
    userName: 'ning.ding'
  }],
  message: '处理成功'
}

const clewInfo = {
  cleanTag: '未核实完整',
  accountMainBody: '李克强',
  area: '上海',
  areaCode: '021',
  certificateNumber: '',
  clewFromSource: '在线咨询',
  clewId: 10001,
  clewStatus: 0,
  clewType: '线索',
  clewWriteAccount: 'si.li',
  clewWriteName: '李四',
  createTime: '2018-01-03 11:03:56',
  createUser: '创建人',
  customerName: '萌店',
  customerPhone: '15898273457',
  customerType: '',
  detailAddress: '长江南路',
  discardReason: '',
  firstFromSource: '一级来源',
  handlerName: '王五',
  handlerNo: '2009',
  id: 1000001,
  industry: '餐饮',
  isDel: 0,
  legalPerson: '',
  manageArea: '经营范围',
  manageProduct: '饮食',
  manageStatus: 1,
  qualificationType: '资质类型',
  registerAddress: '注册地址',
  registerTime: '2018-01-03 11:03:39',
  remark: '备注',
  secordFromSource: '二级来源',
  shopName: 'def餐厅',
  shopType: '商户类型',
  updateTime: '2018-01-05 14:15:56',
  updateUser: '1231',
  urgentStatus: 1,
};
const contacts = [
  {
    id: 1,
    linkType: '类型1',
    linkName: '姓名1',
    sex: '男',
    mobile: '15295012098',
    phone: '电话21',
    position: '职务1',
    department: '部门1',
    qq: 'QQ1',
    wechat: '微信1',
    email: '邮箱1',
  }, {
    id: 2,
    linkType: '类型11',
    linkName: '姓名111',
    sex: '女',
    mobile: '15295012099',
    phone: '电话211',
    position: '职务11',
    department: '部门11',
    qq: 'QQ11',
    wechat: '微信11',
    email: '邮箱11',
  },
]
const stores = [{
  id: 1,
  storeName: '沙县小吃',
  status: '开启',
  area: ['上海', '上海市', '宝山区'],
  address: '逸仙路',
  remark: '葱油拌面',
  contacts,
}, {
  id: 2,
  storeName: '兰州拉面',
  status: '开启',
  area: ['上海', '上海市', '宝山区'],
  address: '逸仙路3000号',
  remark: '牛肉拉面',
  contacts,
}]

const clewStatusObj = [{
  key: '0',
  tab: '线索库',
}, {
  key: '1',
  tab: '待分配', //售前客服
}, {
  key: '2',
  tab: '待清洗', //售前客服
}, {
  key: '3',
  tab: '已废弃', //售前客服
}, {
  key: '4',
  tab: '待分配', //直销
}, {
  key: '5',
  tab: '待清洗', //直销
}, {
  key: '6',
  tab: '待审核', //直销
}, {
  key: '7',
  tab: '已转出', //直销转机会
}, {
  key: '8',
  tab: '已废弃', //直销废弃
}]

export const getClewById = {
  code: 0,
  data: {
    clewInfo,
    customerLinks: contacts,
    stores,
  }
}
