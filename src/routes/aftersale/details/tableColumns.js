import React from 'react';
import _ from 'lodash';
import {
  getGender, getServiceDuration, getChanceOpType, getBusinessType, getCustomerType, getFunnelRank, getBusinessStatus
} from '../../../utils/helpers';

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
    render: getBusinessStatus,
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
