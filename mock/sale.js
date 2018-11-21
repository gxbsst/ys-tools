import { getUrlParams } from './utils';

const type = ['甲级', '乙级'];
const family = ['赵', '贾', '孙', '李', '刘', '吴', '郑', '王', '廖', '陈'];
const name = ['伟', '芳', '昆', '敏', '休', '秀英', '丽', '恒泰', '磊', '洋'];
const level = ['A', 'B', 'C'];
const status = ['wait', 'complete', 'reject'];
const statusName = ['待清洗', '完成', '拒绝'];
// mock tableListDataSource
let tableListDataSource = [];
for (let i = 0; i < 63; i += 1) {
  tableListDataSource.push({
    key: i + 1,
    area: '上海',
    chanceId: i + 1,
    customNo: Math.floor(Math.random() * 1000),
    isUrgent: true,
    level: level[Math.floor(Math.random() * 3)],
    levelName: '甲',
    merchantName: `上海微盟${Math.floor(Math.random() * 80)}`,
    opNO: Math.floor(Math.random() * 1000),
    opName: family[Math.floor(Math.random() * 10)] + name[Math.floor(Math.random() * 10)],
    status: status[i % 3],
    statusName: statusName[1 % 3],
    type: type[Math.floor(Math.random() * 2)],
  });
}

export function getChances(req, res, u) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const params = getUrlParams(url);

  let dataSource = [...tableListDataSource];

  if (params.level) {
    const rank = params.level;
    dataSource = [...dataSource].filter(data => data.level === rank);
  }

  if (params.status) {
    dataSource = [...dataSource].filter(data => data.level === params.status);
  }


  let pageSize = 10;
  if (params.pageSize) {
    pageSize = params.pageSize * 1;
  }

  const result = {
    code: 0,
    data: dataSource,
    pagination: {
      totalCount: dataSource.length,
      pageSize,
      page: parseInt(params.page, 10) || 1,
    },
  };

  if (res && res.json) {
    res.json(result);
  } else {
    return result;
  }
}

export function postChances(req, res, u, b) {
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
export const getChanceDetail = {
  "code": 0,
  "data": {
    "accountMainBody": "243928048209",
    "area": ['北京','北京市','东城区'],
    "areaCode": "021",
    "bindAccount": "2739842398",
    "clewId": 10000,
    "createTime": "2018-01-04 16:39:19",
    "createUser": "习近平",
    "customerName": "abc公司",
    "customerPhone": "298749823",
    "detailAddress": "淞发路",
    "fromSource": "新零售",
    "id": 10000,
    "isDel": 0,
    "manageArea": "餐饮",
    "manageProduct": "奶茶",
    "manageStatus": "open",
    "qualificationType": "a",
    "registerAddress": ['北京','北京市','东城区'],
    "registerTime": "2018-01-04 16:38:50",
    "remark": "备注",
    "saleName": "李四",
    "saleNo": "210",
    "shopName": "adc餐饮",
    "shopType": "餐饮",
    "status": 0,
    "updateTime": "2018-01-04 17:33:37",
    "updateUser": "zhangsan",
  }
};
export const getChanceItention = {
  code: 0,
  data: {
    rank: '甲级',
    price: '123000',
    productType: '餐饮',
    payTime: '2018-12-04 16:39:19',
  },
}
export const getChanceStores = {
  code: 0,
  data:[
    {
      name: '微盟1123',
      state: '开启',
      region: ['上海','上海市','黄浦区'],
      address: '浦东新区三林',
      remark: '温热热无若翁惹',
      id: 123,
      contacts:[
        {
          type: '你好',
          sex: '男',
          position: 'ceo',
          name: '岳生煜',
          part: '老大',
          qq: '893425091',
          email: '893425091@qq.com',
          wx: 'failtale',
          phone1: '15757825776',
          id: 14,
        },
      ],
    },
    {
      name: '微盟23432',
      state: '开启',
      region: ['上海','上海市','黄浦区'],
      address: '浦东新区三林',
      remark: '温热热无若翁惹',
      contacts: [],
      id: 1,
    },
  ],
}
export const getChanceContacts = {
  code: 0,
  data: [
    {
      type: '你好',
      sex: '男',
      position: 'ceo',
      name: '岳生煜',
      part: '老大',
      qq: '893425091',
      email: '893425091@qq.com',
      wx: 'failtale',
      phone1: '15757825776',
      phone2: '17612189459',
      id: 122,
    },
    {
      type: '你好',
      sex: '男',
      position: 'ceo',
      name: '贾坤',
      part: '老大',
      qq: '893425091',
      email: '893425091@qq.com',
      wx: 'failtale',
      phone1: '15757825776',
      id: 12,
    },
    {
      type: '你好',
      sex: '男',
      position: 'ceo',
      name: '泰哥',
      part: '老大',
      qq: '893425091',
      email: '893425091@qq.com',
      wx: 'failtale',
      phone1: '15757825776',
      id: 123
    },
  ],
}
export const getRelativeBusiness = {
  code: 0,
  data: [
    {
      productType: '软件产品',
      businessType: '新开业务',
      productName: '客来店系列',
      productPrice: 13600,
      servicePrice: 1200,
      amount: '2年/1年，10个/1个',
      remittanceStatus: '提单未完成',
      createPerson: 'Serati Ma',
      id: 12321,
    },
    {
      productType: '软件产品',
      businessType: '增加门店',
      productName: '智慧门店',
      productPrice: 20000,
      servicePrice: 20000,
      amount: '20个',
      remittanceStatus: '待回款',
      createPerson: 'Serati Ma',
      id: 789
    },

  ],
}

