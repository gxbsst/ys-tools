// import React from 'react';
import { Select } from 'antd';

const {Option} = Select;

class ParamsMap {
  static rolePermissions = [
    {
      name: '所有权限',
      permissions: [
        2002000, 2002001, 2002002, 2002003, 2002004, 2002005, 2002006, 2002007,
        3000000, 3001000, 3001001, 3001002, 3001003, 3001004,
        4000000, 4001000, 4001001, 4001002, 4001003, 4001004, 4001005, 4001006,
        4002000, 4002001, 4002002, 4002003,
        5000000, 5005000, 5005001, 5005002, 5006000, 5006001, 5006002,
      ]
    },
    { name: '售前主管', permissions: [2002000, 2002003, 3000000, 3001000, 3001001, 3001002]},
    { name: '售前客服', permissions: [2002000, 2002003, 3000000, 3001000, 3001003, 3001004]},
    { name: '新零售线索负责人', permissions: [4000000, 2002001, 4001000, 4001001, 4001002, 4001003, 4002000, 4002001, 4002002]},
    { name: '新零售线索组组长', permissions: [4000000, 2002003, 2002004, 4001000, 4001004, 4001002]},
    { name: '新零售线索组组员', permissions: [4000000, 2002003, 2002004, 2002005, 4001000, 4001005, 4001006]},
    { name: '新零售订单组组长', permissions: [2002003, 4000000, 4002000, 4002001, 4002002]},
    { name: '新零售订单组组员', permissions: [2002003, 4000000, 4002000]},
    { name: '到店常规组组长', permissions: [5000000, 2002002, 2002003, 5005000, 5005001, 5005002]},
    { name: '到店常规组组员', permissions: [5000000, 2002002, 2002003, 2002006, 2002007, 5006000, 5006002]},
    { name: '到店订单组组长', permissions: [5000000, 2002002, 2002003, 5005000, 5005001, 5005002]},
    { name: '到店订单组组员', permissions: [5000000, 2002002, 2002003, 2002006, 2002007, 5005000, 5005001, 5005002]},
  ]

  static tabRolesMap = {
    //售前客服
    3001001: {
      key: '3001001',
      temp: '1,2,3,4,5,6,7,8',
      tab: '线索库',
    },
    3001002: {
      key: '3001002',
      temp: '1',
      tab: '待分配',
    },
    3001003: {
      key: '3001003',
      temp: '2',
      tab: '待清洗',
    },
    3001004: {
      key: '3001004',
      temp: '4,5,6,7,8',
      tab: '已转出',
    },
    //新零售-线索组
    4001001: {
      key: '4001001',
      temp: '4,5,6,7,8,',
      tab: '线索库',
    },
    4001004: {
      key: '4001004',
      temp: '4,5,6,7,8',
      tab: '小组',
    },
    4001002: {
      key: '4001002',
      temp: '6',
      tab: '待审核', //审核
    },
    4001003: {
      key: '4001003',
      temp: '4',
      tab: '待分配',
    },
    4001005: {
      key: '4001005',
      temp: '5',
      tab: '待清洗',
    },
    4001006: {
      key: '4001006',
      temp: '6,',
      tab: '待审核', //提审
    },
    //新零售-订单组
    4002001: {
      key: '4002001',
      temp: '4,5,6,7,8',
      tab: '线索库',
    },
    4002002: {
      key: '4002002',
      temp: '4',
      tab: '待分配',
    },
    4002003: {
      key: '4002003',
      temp: '5',
      tab: '待清洗',
    },
    //到店
    5001001: {
      key: '5001001',
      temp: '4,5,6,7,8',
      tab: '线索库',
    },
    5001002: {
      key: '5001002',
      temp: '4',
      tab: '待分配',
    },
    5001003: {
      key: '5001003',
      temp: '4,',
      tab: '可申领',
    },
    5001004: {
      key: '5001004',
      temp: '5',
      tab: '待清洗',
    },
    5005001: {
      key: '5005001',
      temp: '4,5,6,7,8',
      tab: '线索库',
    },
    5005002: {
      key: '5005002',
      temp: '5',
      tab: '待清洗',
    },
    5006001: {
      key: '5006001',
      temp: '4,5,6,7,8',
      tab: '线索库',
    },
    5006002: {
      key: '5006002',
      temp: '5',
      tab: '待清洗',
    },
  }

  static enterMap = [{ //单条录入权限
    type: '线索库',
    permissions: [2002003],
    desc: '售前客服, 到店/新零售销售（包括订单和常规）/ 到店领导',
    url: 'clewPool',
    id: 1,
  }, {
    type: 'IS公海',
    permissions: [2002004],
    desc: '新零售is（包括订单和常规）/ 新零售领导',
    url: 'ISPublic',
    id: 2,
  }, {
    type: 'IS私海',
    permissions: [2002005],
    desc: '新零售is（包括订单和常规）',
    url: 'ISPrivate',
    id: 3,
  }, {
    type: '到店公海',
    permissions: [2002006],
    desc: '到店销售（包括订单和常规）',
    url: 'arrivalPub',
    id: 4,
  }, {
    type: '到店私海',
    permissions: [2002007],
    desc: '到店销售（包括订单和常规）',
    url: 'arrivalPri',
    id: 5,
  }]

  // {
  //   clewPool: '线索库',
  //   ISPublic: 'IS公海',
  //   ISPrivate: 'IS私海',
  //   arrivalPub: '到店公海',
  //   arrivalPri: '到店私海',
  // }
  static getEnterTarget() {
    const enterTarget = {};
    for (const value of Object.values(ParamsMap.enterMap)) {
      enterTarget[value.url] = value.type;
    }
    return enterTarget;
  }

  static clewFieldLabels = {
    clewType: '线索类型',
    clewFromSource: '线索来源',
    sourceTag: '来源标签',
  }

  static contactFieldLabels = {
    linkType: '类型',
    linkName: '姓名',
    sex: '性别',
    mobile: '手机',
    phone: '电话',
    position: '职务',
    department: '部门',
    qq: 'QQ',
    wechat: '微信',
    email: '邮箱',
  }

  static customerFieldLabels = {
    customerType: '客户类型',
    manageStatus: '经营状态',
    registerTime: '注册时间',
    customerName: '客户名称',
    idNumber: '身份证号',
    manageArea: '经营范围',
    registerAddress: '注册地址',
    shopName: '商户名称',
    manageProduct: '主营产品',
    legalPerson: '法人',
    shopType: '商户类型',
    cuisine: '菜系',
    qualificationType: '资质类型',
    accountMainBody: '账号主体',
    starLevel: '星级',
    certificateNumber: '证件号码',
    industryId: '行业',
    areaCode: '地区',
    detailAddress: '地址',
    companyDetail: '公司详情',
  }

  static clewBaseInfoLabels = {
    clewId: '线索ID',
    clewType: '线索类型',
    customerType: '客户类型',
    customerName: '客户名称',
    shopName: '商户名称',
    firstFromSource: '一级来源',
    secondFromSource: '二级来源',
    sourceTag: '来源标签',
    createTime: '创建时间',
    accountMainBody: '账号主体',
    industry: '行业',
    areaCode: '地区',
    detailAddress: '地址',
    manageStatus: '经营状态',
    manageArea: '经营范围',
    manageProduct: '主营产品',
    registerTime: '注册时间',
    registerAddress: '注册地址',
    legalPerson: '法人',
    qualificationType: '资质类型',
    certificateNumber: '证件号码',
    companyDetail: '公司详情',
  }

  static clewInfoLabels = {
    id: '线索ID',
    sourceTag: '来源标签',
    createTime: '创建时间',
  }

  /*<----------|enum map|---------->*/
  /* eslint-disable */
  static renderObjOptions = (enumObj) =>
    Object.entries(enumObj).map(([k, v]) => <Option key={k} value={~~k}>{v}</Option>)

  static renderOptions = (enumMap) =>
    Array.from(enumMap, ([k, v]) => <Option key={k} value={k}>{v}</Option>)
  /* eslint-enable */

  static genderMap = new Map([ //性别
    [1, '男'],
    [2, '女'],
  ])
  static linkTypeMap = new Map([ //联系人类型
    [1, '主决策人'],
    [2, '其他'],
  ])
  static clewTypeMap = new Map([ //线索类型
    [1, '新零售'],
    [2, '到店'],
    [3, '渠道加盟'],
    [4, '定制开发'],
  ])
  static customerTypeMap = new Map([ //客户类型
    [1, '个人商户'],
    [2, '公司'],
    [3, '外资公司'],
    [4, '连锁店'],
  ])
  static cleanTagMap = new Map([ //清洗标签
    [1, '核实完整'],
    [2, '未核实完整'],
    [3, '客户反感'],
    [4, '无人接听'],
    [5, '无效资料'],
    [6, '空号'],
    [7, '错号'],
  ])
  static clewStatusMap = new Map([
    [1, '待分配'], //售前客服
    [2, '待清洗'], //售前客服
    [3, '已废弃'], //售前客服
    [4, '待分配'], //直销
    [5, '待清洗'], //直销
    [6, '待审核'], //直销
    [7, '已转出'], //直销转机会
    [8, '已废弃'], //直销废弃
  ])
  /*<------product map -------->*/
  static chargeModeMap = new Map([ //计费方式
    [1, '期限'],
    [2, '数量'],
  ])
  static chargeUnitMap = new Map([ //计费单位
    [1, '个'],
    [2, '次'],
    [3, '年'],
    [4, '月'],
  ])
  static saleVersionMap = new Map([ //期限版本
    [1, '标准版'],
    [2, '高级版'],
    [3, '豪华版'],
    [4, '至尊版'],
  ])

  /*<----------|columns|---------->*/

  static contactsColumns = [
    {
      title: '类型',
      dataIndex: 'linkType',
      render: val => ParamsMap.linkTypeMap.get(val),
    }, {
      title: '性别',
      dataIndex: 'sex',
      render: val => ParamsMap.genderMap.get(val),
    }, {
      title: '职务',
      dataIndex: 'position',
    }, {
      title: '姓名',
      dataIndex: 'linkName',
    }, {
      title: '部门',
      dataIndex: 'department',
    }, {
      title: 'qq',
      dataIndex: 'qq',
    }, {
      title: '手机',
      dataIndex: 'mobile',
    }, {
      title: '电话',
      dataIndex: 'phone',
    }, {
      title: '微信',
      dataIndex: 'wechat',
    }, {
      title: '邮箱',
      dataIndex: 'email',
    }, {
      title: '状态',
      dataIndex: 'status',
      render: val => !val ? '有效' : '无效',
    },
  ]
}

export default ParamsMap;
