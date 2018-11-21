import React from 'react';
import _ from 'lodash';
import {
  getGender, getServiceDuration, getChanceOpType, getBusinessType, getCustomerType, getFunnelRank
} from '../../../utils/helpers';

// 权限判断
export function getPermissionTags(permission) {
  if (!_.isArray(permission)) {
    return console.warn('权限列表不是个数组');
  }
  return {
    isIS: permission.includes(4003000) || permission.includes(4004000),
    isOS: permission.includes(4005000) || permission.includes(4006000),
  }
}
// 付款方式
export const PayModesColumns = [
  {
    title: '付款条件',
    dataIndex: 'payCondition',
    key: 'payCondition',
    width: 75,
    render: (text) => {
      return (
        <span>{text === 'full' ? '全额' : '分期'}</span>
      );
    },
  }, {
    title: '付款金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 100,
  }, {
    title: '付款占比',
    dataIndex: 'payScale',
    key: 'payScale',
    render: (text) => <span>{text * 100}%</span>,
    width: 100,
  }, {
    title: '付款日期',
    dataIndex: 'payTime',
    key: 'payTime',
    width: 100,
  }, {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 100,
  }];
// 业务
export const BusinessColumns = [
  {
    title: '产品类型',
    dataIndex: 'productType',
    key: 'productType',
    width: 100,
  }, {
    title: '业务类型',
    dataIndex: 'itemType',
    key: 'itemType',
    render: (text) => getBusinessType(text),
    width: 100,
  }, {
    title: '产品名称',
    dataIndex: 'productName',
    key: 'productName',
    width: 100,
  }, {
    title: '产品金额 (¥)',
    dataIndex: 'productAmount',
    key: 'productAmount',
    render: (text, record) => text - record.discountProductAmount,
    width: 100,
  }, {
    title: '服务费金额 (¥)',
    dataIndex: 'serviceAmount',
    key: 'serviceAmount',
    render: (text, record) => text - record.discountServiceAmount,
    width: 100,
  }, {
    title: '业务量 / 赠送量',
    dataIndex: 'dredgeTimes',
    key: 'dredgeTimes',
    render: getServiceDuration,
    width: 100,
  }, {
    title: '回款状态',
    dataIndex: 'backPayStatusName',
    key: 'backPayStatusName',
    width: 100,
  }, {
    title: '创建人',
    dataIndex: 'createUserName',
    key: 'createUserName',
    width: 100,
  }];
// 机会联系人
export const contactsColumns = [
  {
    title: '类型',
    dataIndex: 'linkType',
    key: 'linkType',
    render: (text) => text == 1 ? '主决策人' : '其他',
    width: 75,
  }, {
    title: '性别',
    dataIndex: 'sex',
    key: 'sex',
    render: (text) => getGender(text),
    width: 50,
  }, {
    title: '职务',
    dataIndex: 'position',
    key: 'position',
    width: 75,
  }, {
    title: '姓名',
    dataIndex: 'linkName',
    key: 'linkName',
    width: 75,
  }, {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    width: 100,
  }, {
    title: 'qq',
    dataIndex: 'qq',
    key: 'qq',
    width: 120,
  }, {
    title: '电话1',
    dataIndex: 'phone',
    key: 'phone',
    width: 120,
  }, {
    title: '电话2',
    dataIndex: 'mobile',
    key: 'mobile',
    width: 120,
  }, {
    title: '微信',
    dataIndex: 'wechat',
    key: 'wechat',
    width: 120,
  }, {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 150,
  },
];
// 机会门店
export const chainStoreColumns = [
  {
    title: '门店名',
    dataIndex: 'storeName',
    key: 'storeName',
    width: 100,
  }, {
    title: '经营状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  }, {
    title: '地区',
    dataIndex: 'area',
    key: 'area',
    width: 100,
  }, {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 150,
  }, {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
    width: 150,
  },
];
// 线索日志类型
export const clewsOpTypesColumns = [
  {
    title: '日志类型',
    dataIndex: 'opTypeName',
    key: 'opTypeName',
    width: 100,
  },
];
// 机会日志类型
export const chanceOpTypesColumns = [
  {
    title: '日志类型',
    dataIndex: 'opType',
    key: 'opType',
    render: (text) => getChanceOpType(text),
    width: 100,
  },
]

// 私海待审核
export const pendingApprovalColumns = [
  {
    title: '审批流id',
    dataIndex: 'id',
    key: 'id',
  }, {
    title: '审批类型',
    dataIndex: 'processName',
    key: 'processName',
  }, {
    title: '申请人',
    dataIndex: 'applyRealName',
    key: 'applyRealName',
  }, {
    title: '申请时间',
    dataIndex: 'applyTime',
    key: 'applyTime',
  }, {
    title: '当前处理人',
    dataIndex: 'examineName',
    key: 'examineName',
  }, {
    title: '机会id',
    dataIndex: 'chanceId',
    key: 'chanceId',
  }, {
    title: '客户类型',
    dataIndex: 'customerType',
    key: 'customerType',
    render: (text) => (
      <span>{ getCustomerType(text) }</span>
    ),
  }, {
    title: '客户名',
    dataIndex: 'customerName',
    key: 'customerName',
  }, {
    title: '漏斗等级',
    dataIndex: 'level',
    key: 'level',
    render: (text) => (
      <span>{ getFunnelRank(text) }</span>
    ),
  }, {
    title: '加急标签',
    dataIndex: 'urgentStatus',
    key: 'urgentStatus',
    render: (text) => (
      <span>{ text == 0 ? '未加急' : '加急'}</span>
    ),
  },
]
